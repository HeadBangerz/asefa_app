var timer = null;

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('inpttext', 'test');
  Session.setDefault('connected', false);
  Session.setDefault('adminConnection', false);
  reAuth();
  
  function reAuth() {
    setTimeout(function() {
    if(Session.get('connected') === true) {
      if(Session.get('adminConnection') === true) {
        sendAdminAuth("reauth", Meteor._localStorage.getItem('name'), Meteor._localStorage.getItem('myid'));
      }
      else {
        sendAuth("reauth", Meteor._localStorage.getItem('name'), Meteor._localStorage.getItem('myid'));
      }
    }
    reAuth();
    }, 30000);
  }
  
  
  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1)
      if('counter', Session.get('counter') > 199) {
        Session.set('counter', 198);
      }
    }
  });
  
  Template.auth.helpers({
    inpttext: function () {
      return Session.get('inpttext');
    }
  });
  
    Template.auth.result = function () {
	    return Session.get('serverResponse') || '';
    };
    
    Template.auth.rendered = function() {
    if(!this._rendered) {
      this._rendered = true;
      var temp = localStorage.getItem('name');
      document.getElementById('myid').value = temp;
      var temp2 = localStorage.getItem('myid');
      if(temp2.indexOf("code:" >= 0)){
        document.getElementById('authenticator').click();
      }
    }
  };
  
  
  Template.auth.helpers({
    connected: function () {
    return Session.get('connected');
    }
  });
    
    Template.auth.events({
    'click #authenticator': function () {
      //Session.set('inpttext', document.getElementById('inpttext'));
      //Meteor._localStorage.setItem("name", document.getElementById('inpttext').value);
      if(document.getElementById('myid').value == "God") {
        Meteor._localStorage.setItem('name', document.getElementById('myid').value);
        sendAdminAuth(document.getElementById('inpttext').value, document.getElementById('myid').value, localStorage.getItem('myid'));
      }
      else if(document.getElementById('myid').value !== "") {
        Meteor._localStorage.setItem('name', document.getElementById('myid').value);
        sendAuth(document.getElementById('inpttext').value, document.getElementById('myid').value, localStorage.getItem('myid'));
      }
      else {
        document.getElementById('result').innerHTML = "Please enter your name.";
      }
    }});
    
    
    function sendAdminAuth(pw, name, uniqueid){
      Session.set('adminConnection', true);
      Meteor.call('adminAuthenticate', pw, name, uniqueid, function(err, response) {
        if(err) {
				Session.set('serverResponse', 'Error:' + err.reason);
				document.getElementById('result').innerHTML = Session.get('serverResponse');
				return;
  			}
  			Session.set('serverResponse', response);
  			//alert(Session.get('serverResponse'));
  			 //document.getElementById('result').innerHTML = Session.get('serverResponse');
  			 if(Session.get('serverResponse').indexOf("code:") != -1) {
  			   document.getElementById('result').innerHTML = "You have been granted Admin privileges.";
  			   setVal();
  			 }
  			 else if(Session.get('serverResponse') == 'Error') {
  			   document.getElementById('result').innerHTML = "There was an error, please try again.";
  			 }
  			 else if(Session.get('serverResponse') == "Successful reauth") {
  			   var d = new Date();
  			   var hours = ('0'+d.getHours()).slice(-2);
  			   var mins = ('0'+d.getMinutes()).slice(-2);
  			   var secs = ('0'+d.getSeconds()).slice(-2);
  			   document.getElementById('result').innerHTML = "Last authenticated at: "+hours+":"+mins+":"+secs;
  			 }
  			 else {
  			   document.getElementById('result').innerHTML = Session.get('serverResponse');
  			 }
  			 setVal();
        });
        //setVal();
    }
    
    
    function sendAuth(pw, name, uniqueid){
      Session.set('adminConnection', false);
      Meteor.call('authenticate', pw, name, uniqueid, function(err, response) {
        if(err) {
				Session.set('serverResponse', 'Error:' + err.reason);
				document.getElementById('result').innerHTML = Session.get('serverResponse');
				return;
  			}
  			Session.set('serverResponse', response);
  			//alert(Session.get('serverResponse'));
  			 //document.getElementById('result').innerHTML = Session.get('serverResponse');
  			 if(Session.get('serverResponse').indexOf("code:") != -1) {
  			   document.getElementById('result').innerHTML = "You have entered the correct code.";
  			   setVal();
  			 }
  			 else if(Session.get('serverResponse') == 'Error') {
  			   document.getElementById('result').innerHTML = "There was an error, please try again.";
  			 }
  			 else if(Session.get('serverResponse') == "Successful reauth") {
  			   var d = new Date();
  			   var hours = ('0'+d.getHours()).slice(-2);
  			   var mins = ('0'+d.getMinutes()).slice(-2);
  			   var secs = ('0'+d.getSeconds()).slice(-2);
  			   document.getElementById('result').innerHTML = "Last authenticated at: "+hours+":"+mins+":"+secs;
  			 }
  			 else {
  			   document.getElementById('result').innerHTML = Session.get('serverResponse');
  			 }
  			setVal();
        });
        //setVal();
    }
    
    
    function setVal(){
      if(Session.get('serverResponse') !== undefined) { 
        if(Session.get('serverResponse').indexOf("Welcome") == -1) {
          if(Session.get('serverResponse').indexOf("Error") == -1) {
            if(Session.get('serverResponse').indexOf("Successful reauth") == -1) {
              if(Session.get('serverResponse') != "Incorrect") {
                 Meteor._localStorage.setItem("myid", Session.get('serverResponse'));
                 Session.set('connected', true);
                 Meteor.subscribe('headers');
                }
                else {
                Meteor._localStorage.removeItem("myid");
                }
            } 
            else {
              Session.set('connected', true);
              Meteor.subscribe('headers');
            }
          } 
          else {
            Meteor._localStorage.removeItem("myid");
          }
        }
        else {
        Session.set('connected', true);
        Meteor.subscribe('headers');
        }
      }
    }
    
    
    
    Template.auth.events({
      'keyup #inpttext': function(event) {
    if(event.keyCode == 13) {
        document.getElementById('authenticator').click();
        }
      },
      
      'click #disconnect': function() {
        var areYouSure = confirm('האם ברצונך להתנתק?');
        if(areYouSure === true) {
          Meteor._localStorage.removeItem("myid");
          Meteor._localStorage.removeItem("name");
          Session.set('connected', false);
          Session.set('adminConnection', false);
          document.getElementById('result').innerHTML = "Disconnected.";
          Meteor.call('disconnect');
        }
      },
      
      'click #refresh': function() {
        //var areYouSure = confirm('ברצונך לרענן את האפליקציה?');
        //if(areYouSure === true) 
          location.reload();
        }
    });
    


   Template.headers.events({
     'click #add': function(){
       //Headers.insert({header: document.getElementById('headerinput').value, headercontent: document.getElementById('headercontent').value, headerhighlight: false});
       Meteor.call('insertheader', document.getElementById('headerinput').value, document.getElementById('headercontent').value);
       document.getElementById('headerinput').value = "";
       document.getElementById('headercontent').value = "";
       document.getElementById('headerinput').focus();
     }
   });
   
  Template.headers.events({
     'click #clear': function(){
       var areYouSure = confirm('למחוק את כל הכותרות?');
       if(areYouSure === true) {
        Meteor.call('delheaders');
       }
     }
   });
   
   Template.headers.events({
     'change select': function(event){
      Meteor.call('updateStatus', event.currentTarget.id, event.currentTarget.value);
      
      if(event.currentTarget.value == 'current') {
        var dropdowns = document.getElementsByTagName('select');
        for (var i = 0; i < dropdowns.length; i++) {  
  			  if (dropdowns[i].id !== event.currentTarget.id) {  
  			    if (dropdowns[i].value == 'current') {
  			      var result = confirm("האם ההצעה/בקשה הקודמת עברה?");
  			      if (result === true) {
    		    	Meteor.call('updateStatus', dropdowns[i].id, 'avar');
  			      }
  			      else {
  			        Meteor.call('updateStatus', dropdowns[i].id, 'nafal');
  			      }
  			    }
 	 	      } 
        }
      }
      
        positionAdminControls(10);
     },
     'keyup pre': function(event){
        //$(event.currentTarget).height( 0 );
        //$(event.currentTarget).height( event.currentTarget.scrollHeight );
       if(event.keyCode == 115) {
        if(event.currentTarget.innerText !== event.currentTarget.getAttribute('data-value')) {
          Meteor.call('updatecontent', event.currentTarget.id, event.currentTarget.innerText);
          event.currentTarget.focus();
          event.currentTarget.innerText = "";
        }
       }
     },
     'click #reorderUp': function(event) {
       Meteor.call('headerReorder', event.currentTarget.getAttribute('data-Position'), "up");
      
     },
     'click #reorderDown': function(event) {
       Meteor.call('headerReorder', event.currentTarget.getAttribute('data-Position'), "down");
     },
     
     'keyup #headerinput': function(event) {
       if(event.keyCode == 13) {
         document.getElementById('headercontent').focus();
       }
     },
     
     'keyup #headercontent': function(event) {
       if(event.keyCode == 13) {
         document.getElementById('add').click();
       }
     },
     "change li":function() {
        positionAdminControls(10);
     },
     'click #delete':function(event) {
       Meteor.call('delheader', event.currentTarget.getAttribute('data-Position'));
       positionAdminControls(150);
     },
     'dblclick .header':function(event) {
      if(Session.get('adminConnection') === true) 
        var headerText = prompt('Please enter the new title', event.currentTarget.getAttribute('data-Header'));
        if(headerText !== null && headerText !== event.currentTarget.getAttribute('data-Header')) {
          Meteor.call('renameHeader', event.currentTarget.getAttribute('data-Position'), headerText);
        }
     },
      'click .callPeeps':function(event) {
        var time = prompt("כמה זמן (בשניות) לתקצב לקרוא לאנשים?", "90");
        var d = new Date().getTime();
        //var selects = document.getElementsByTagName('select');
        if(time !== null) {
          Meteor.call('updatecontent', -1, event.currentTarget.getAttribute('data-Header'));
          Meteor.call('renameHeader', -1, d+time*1000);
          Meteor.call('updateStatus', -1, 'current');
          Meteor.call('updateStatus', parseInt(event.currentTarget.getAttribute('data-Position'),10), "current");
          //selects[event.currentTarget.getAttribute('data-Position')].selectedIndex=1;
          //selects[event.currentTarget.getAttribute('data-Position')].onchange();
          
          var dropdowns = document.getElementsByTagName('select');
          for (var i = 0; i < dropdowns.length; i++) {  
    			  if (dropdowns[i].id !== event.currentTarget.getAttribute('data-Position') && dropdowns[i].id > -1) {  
    			    if (dropdowns[i].value == 'current') {
    			      var result = confirm("האם ההצעה/בקשה הקודמת עברה?");
    			      if (result === true) {
      		    	  Meteor.call('updateStatus', dropdowns[i].id, 'avar');
    			      }
    			      else {
    			        Meteor.call('updateStatus', dropdowns[i].id, 'nafal');
    			      }
    			    }
   	 	      } 
          }
          
        }
      }
     
     //OLD CHECKBOX CODE
//     'change input[type=checkbox]': function(event){
//       if(event.currentTarget.checked === true) {
//         Meteor.call('updatehighlight', event.currentTarget.id, true);
//       }
//       else {
//         Meteor.call('updatehighlight', event.currentTarget.id, false);
//       }
//       var checked = $("input:checkbox");
//       for (var i = 0; i < checked.length; i++) {  
//  			  if (checked[i].id !== event.currentTarget.id) {  
//  			    if (checked[i].checked === true)
//    		    	Meteor.call('updatehighlight', checked[i].id, false); 
//	 	       } 
//      }
//        positionAdminControls(10);
//     },
     
     
     
   });
   
  //Template.headers.headers  = function() {
  //  Meteor.subscribe('headers');
  //  return Headers.find({}, {sort:{ position : 1 } });
  // };
   
   Template.headers.helpers({
    headers: function() {
    Meteor.subscribe('headers');
    return Headers.find({}, {sort:{ position : 1 } });
    },
    adminConnection: function () {
    return Session.get('adminConnection');
    },
    width: function() {
       positionAdminControls(10);
    },
    checkSelected: function() {
      setTimeout(function() {
      var dropdowns = document.getElementsByTagName('select');
      for (var i = 0; i < dropdowns.length; i++) {  
  			if(dropdowns[i].getAttribute('data-selectedVal') == 'unmarked') {
  			  dropdowns[i].selectedIndex=0;
  			}
  			else if(dropdowns[i].getAttribute('data-selectedVal') == 'current') {
  			  dropdowns[i].selectedIndex=1;
  			}else if(dropdowns[i].getAttribute('data-selectedVal') == 'nafal') {
  			  dropdowns[i].selectedIndex=2;
  			}
  			else if(dropdowns[i].getAttribute('data-selectedVal') == 'postponed') {
  			  dropdowns[i].selectedIndex=3;
  			}
  			else if(dropdowns[i].getAttribute('data-selectedVal') == 'avar') {
  			  dropdowns[i].selectedIndex=4;
  			}
      }
      }, 10);
    },
    getTime: function() {
      setTimeout(function() {
      var timers = document.getElementsByClassName('timerx');
      //var oneIsActive = null;
      var activeTimer = null;
      for (var i =0; i < timers.length; i++) {
        if (timers[i].getAttribute('data-active') == "true") {
          //timers[i].innerHTML = "";
          //document.getElementById('timer').innerHTML = "";
          activeTimer = i;
        }
        //else {
        //  deactivateTimer();
        //  document.getElementById('timer').innerHTML = "";
        //  activateTimer(i);
        //  oneIsActive = true;
        //}
      }
      if(activeTimer !== null) {
        if(document.getElementById('timer').getAttribute('data-currentTime') !== timers[activeTimer].getAttribute('data-Time')) {
          deactivateTimer();
        }
        activateTimer(activeTimer);
        document.getElementById('timer').setAttribute('data-currentTime', timers[activeTimer].getAttribute('data-Time'));
        //deactivateTimer();
        //document.getElementById('timer').innerHTML = "";
      }
      else {
        deactivateTimer();
        document.getElementById('timer').innerHTML = "";
      }
    }, 10);
    }
  });
  
function deactivateTimer() {
  clearInterval(timer);
  timer = null;
  document.getElementById('timer').innerHTML = "";
}
function activateTimer(object) {
  var timers = document.getElementsByClassName('timerx');
  if (timer !== null) return;
  timer = setInterval(function () {
  //value = value+1;
  var currentTime = new Date().getTime();
  if(document.getElementsByClassName('pos-1')[0].getAttribute('class').indexOf('statuscurrent') !== -1) {
    if(currentTime < parseInt(document.getElementsByClassName('header')[0].getAttribute('data-Header'),10)) {
      var h = 0;
      var m = 0;
      var s = 0;
      var ms = 0;
      var oh = 0;
      var om = 0;
      var os = 0;
      var oms = 0;
      h = Math.floor(currentTime / (60 * 60 * 1000) );
      currentTime = currentTime % (60 * 60 * 1000);
      m = Math.floor(currentTime / (60 * 1000) );
      currentTime = currentTime % (60 * 1000);
      s = Math.floor(currentTime / 1000 );
      ms = currentTime % 1000;
      var oldTime = parseInt(document.getElementsByClassName('header')[0].getAttribute('data-Header'),10);
      oh = Math.floor(oldTime / (60 * 60 * 1000) );
      oldTime = oldTime % (60 * 60 * 1000);
      om = Math.floor(oldTime / (60 * 1000) );
      oldTime = oldTime % (60 * 1000);
      os = Math.floor(oldTime / 1000 );
      oms = oldTime % 1000;
      //Meteor.call('renameHeader', -1, parseInt(document.getElementsByClassName('header')[0].getAttribute('data-Header'),10)-1);
      if(os >= s && om >= m) {
        document.getElementById('timer').innerHTML = pad(om-m,2)+":"+pad(os-s,2);//document.getElementsByClassName('header')[0].getAttribute('data-Header');
        document.getElementById('timetest').innerHTML = "om:"+om+" m:"+m+" os"+os+" s"+s;
      }
      else if(os <= s && om >= m) {
        var minusSecs = os-s;
        var minusMins = om-m;
        document.getElementById('timer').innerHTML = pad(om-m-1,2)+":"+pad(minusSecs+59,2);
        document.getElementById('timetest').innerHTML = "om:"+om+" m:"+m+" os"+os+" s"+s;
      }
      else if(os >= s && om <= m) {
        var minusSecs = os-s;
        var minusMins = om-m;
        document.getElementById('timer').innerHTML = pad(minusMins+60,2)+":"+pad(os-s,2);
        document.getElementById('timetest').innerHTML = "om:"+om+" m:"+m+" os"+os+" s"+s;
      }
      else {
        var minusSecs = os-s;
        var minusMins = om-m;
        document.getElementById('timer').innerHTML = pad(minusMins+59,2)+":"+pad(minusSecs+59,2);
        document.getElementById('timetest').innerHTML = "om:"+om+" m:"+m+" os"+os+" s"+s;
      }
      h = 0;
      m = 0;
      s = 0;
      ms = 0;
      oh = 0;
      om = 0;
      os = 0;
      oms = 0;
    }
    else {
      Meteor.call('updateStatus', -1, 'unmarked');
      Meteor.call('updateStatus', parseInt(timers[object].getAttribute('data-Position'),10), 'current');
    }
  }
  else {
    var oldTime = timers[object].getAttribute('data-Time');
    currentTime = currentTime-oldTime;
    var h = 0;
    var m = 0;
    var s = 0;
    var ms = 0;
    h = Math.floor(currentTime / (60 * 60 * 1000) );
    currentTime = currentTime % (60 * 60 * 1000);
    m = Math.floor(currentTime / (60 * 1000) );
    currentTime = currentTime % (60 * 1000);
    s = Math.floor(currentTime / 1000 );
    ms = currentTime % 1000;
    if(h !== 0) {
    currentTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2);
    }
    else {
    currentTime = pad(m, 2) + ':' + pad(s, 2);
    }
    document.getElementById('timer').innerHTML = currentTime;
  }
  }, 1000); 
}  

function pad(num, size) {
          var s = "0000" + num;
          return s.substr(s.length - size);
}

function positionAdminControls(time) {
  setTimeout(function() {
  var headerwidth = 0;
  $('.header').each( function (index, data) {
  	 if($(this).attr('data-Position') !== -1) {
    	 if (headerwidth < $(this).width()) {
    		 headerwidth = $(this).width();
    	 }
  	 }
	});
	var summarywidth = $('summary').eq(1).width();
	var admincontrolwidth = $('.admincontrols').eq(1).width();
	var padding = summarywidth-headerwidth-admincontrolwidth-25;
	var admincontrols = document.getElementsByClassName('admincontrols');
  for (var i = 0; i < admincontrols.length; i++) {
    admincontrols[i].setAttribute('style', "padding-left:"+padding+"px;");
  }
  }, time);
}
 
//old code not in use    Template.headers.getheight = function(){
//      var textareas = document.getElementsByTagName('textarea');
//      for (var i = 0; i < textareas.length; i++) {
//      //alert(textareas[i].scrollHeight);
//      textareas[i].setAttribute("style", "height:"+textareas[i].scrollHeight+"px !important;");
//      } 
//    };
   
   
   Template.SecTest.peeps = function() {
     return Peeps.find();
   };
}
Headers = new Mongo.Collection('headers');
if (Meteor.isServer) {
  Meteor.publish('headers', function() {
        console.log(this.userId);
        if(this.userId !== null) {
         return Headers.find({ $query: {}, $orderby: { position : 1 } });
        }
      });
  Meteor.startup(function () {
    // code to run on server at startup
    // HEADERS DB
    Headers.upsert({
     position: -1 
    },
    {
      $set: {header: "pause", headercontent: null, status: "unmarked", position: -1}
    });
    
    Headers.allow({
    insert: function (userId, post) {
      if(userId.indexOf('God-code:') !== -1) {
        return post;
      }
    },
      update: function (userId, post) {
        if(userId.indexOf('God-code:') !== -1) {
          return post;
        }
      }
    });
  
    //USER DB
    Peeps = new Mongo.Collection('peeps');
    if(Assets.getText('Peepsdelete.txt') == "1") {
      var fs = Npm.require('fs');
      Peeps.remove({});
      var base = process.env.PWD;
      console.log(base);
      fs.writeFile(base+'/private/Peepsdelete.txt', '0', function (err) {
       if (err) throw err;
      console.log('It\'s saved!');
      });
      console.log(Assets.getText('Peepsdelete.txt'));
    }
    
    //METHODS
     Meteor.methods({
      authenticate: function (pw, name, code) {
      if(code === null) {
        if(pw == Assets.getText('password.txt')) {
        var gencode = Random.id([17]);
        Peeps.insert({name: name, code: 'code:'+gencode});
        this.setUserId('user-code:'+gencode);
        console.log(name+"("+this.userId+") has been generated.");
        return 'code:'+gencode;
        }
        else {
          return 'Incorrect';
        }
       }
      else {
        if(Peeps.findOne({code: code, name: name})) {
          //if(Peeps.findOne({name: name})) {
            this.setUserId('user-'+code);
            console.log(name+"("+this.userId+") has connected.");
            if(pw == "reauth") {
              return "Successful reauth";
            }
            else {
            return 'Welcome ' + name;
            }
          //}
          //else {
          //  return 'Error';
          //}
        }
        else {
          return 'Error';
        }
      }
      }}
      );
      
      Meteor.methods({
        adminAuthenticate: function (pw, name, code){
        //if(Meteor.users.findOne(name) === false)
        var fs = Npm.require('fs');
        var base = process.env.PWD;
          if(code === null) {
            if(pw == Assets.getText('Adminpassword.txt')) {
              var gencode = Random.id([34]);
              console.log(base);
              fs.writeFile(base+'/.Admin stuff/AdminID.txt', fs.readFileSync(base+'/.Admin stuff/AdminID.txt', 'utf8') + '\rcode:'+gencode, function (err) {
              if (err) throw err;
              console.log('It\'s saved!');
              });
              this.setUserId("God-code:"+gencode);
              console.log(Meteor.userId());
              return 'code:'+gencode;
            }
            else {
              return 'Incorrect';
            }
          }
          else {
          if(fs.readFileSync(base+'/.Admin stuff/AdminID.txt', 'utf8').indexOf(code) !== -1) {
            this.setUserId("God-"+code);
            console.log(Meteor.userId());
            if(pw == "reauth") {
              return "Successful reauth";
            }
            else {
            return 'Welcome ' + name;
            }
          }
          else {
            return 'Error';
          }
        }
      //else {
      //return 'Error';
      //}
        }
      });
      
      Meteor.methods({
      delheaders: function(){
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          Headers.remove({position: {$gt: 0}});
        }
        console.log(Meteor.userId());
      }
      });
      
    //  Meteor.methods({
    //  getheaders: function(){
    //    //if(Meteor.userId() !== null) {
    //    console.log("Get headers: "+Meteor.userId());;
    //    return Headers.find({});
    //   // }
    //  }
    //  });
      
      Meteor.methods({
      insertheader: function(header, content){
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          Headers.insert({header: header, headercontent: content, status: "unmarked", position: Headers.find().count()});
        }
        console.log("Insert header: "+Meteor.userId());
      }
      });
      
      Meteor.methods({
        updateStatus: function(headerPos, newStatus) {
          if(Meteor.userId().indexOf('God-code:') !== -1) {
            Headers.update({
            position: parseInt(headerPos,10)
           }, {
           $set: {status: newStatus}
           });
           
           if(newStatus == "current") {
             Meteor.call('setTimer', headerPos, "start");
           }
           else {
             Meteor.call('setTimer', headerPos, "stop");
           }
          }
          console.log("updateStatus: "+Meteor.userId());
      },
      updatecontent: function(headerPos, content) {
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          Headers.update({
          position: parseInt(headerPos,10)
          }, {
          $set: {headercontent: content}
          });
        }
        console.log("updatecontent: "+Meteor.userId());
      },
      headerReorder: function(position, direction) {
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          if (position > -1) {
            if(direction == "up" && position > 1) {
              Headers.update({
                position: parseInt(position, 10)
              }, {
                $set: {position: null}
              });
              Headers.update({
                position: parseInt(position, 10)-1
              }, {
                $inc: {position: 1}
              });
              Headers.update({
                position: null
              }, {
                $set: {position: parseInt(position, 10)-1}
              });
            }
            if(direction =="down" && position < Headers.find().count()-1) {
              Headers.update({
                position: parseInt(position, 10)
              }, {
                $set: {position: null}
              });
              Headers.update({
                position: parseInt(position, 10)+1
              }, {
                $inc: {position: -1}
              });
              Headers.update({
                position: null
              }, {
                $set: {position: parseInt(position, 10)+1}
              });
            }
          }
      }
        console.log("reorder "+direction+": "+Meteor.userId());
      },
      disconnect: function(){
        console.log(this.userId + " set to null.");
        this.setUserId(null);
      },
      delheader:function(headerPos) {
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          if(headerPos > -1) {
            Headers.remove({position: parseInt(headerPos,10)});
            
            Headers.update({
              position: {$gt: parseInt(headerPos,10)}
            }, {
              $inc: {position: -1}
            }, 
            {multi:true}
            );
          }
        }
        console.log("Delete header: "+headerPos+" - "+Meteor.userId());
      },
      renameHeader:function(headerPos, newHeader) {
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          Headers.update({
          position: parseInt(headerPos,10)
          }, {
          $set: {header: newHeader}
          });
        }
        console.log("Header rename: "+Meteor.userId());
      },
      setTimer: function(headerPos, mode) {
        if(Meteor.userId().indexOf('God-code:') !== -1) {
          if(mode == "start"){
          Headers.update({
            position: parseInt(headerPos,10)
          },
          {
            $set: {
              time: new Date().getTime(),
              active: true
            }
          });
          }
          else {
            Headers.update({
              position: parseInt(headerPos,10)
          },
          {
            $set: {
              active: false
            }
          });
          }
        }
      }
      });
  });
  
}