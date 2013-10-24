/***
 * File: angular-chat.js
 * Author: Jade Krafsig
 * Source: design1online.com, LLC
 * License: GNU Public License
 ***/

/***
 * Purpose: load bootstrap ui angular modules
 * Precondition: none
 * Postcondition: modules loaded
 ***/
angular.module('angular_chat', ['ui.bootstrap']);

/***
 * Purpose: load the existing chat logs
 * Precondition: none
 * Postcondition: chat logs have been loaded
 ***/
function chatCtrl($scope, $http) { 
  
  /***
   * Configurable global variables
   ***/
  $scope.chatChannel = "angular_chat";
  $scope.messageLimit = 50;
  $scope.defaultUsername = "Guest";
  
  /***
   * Static global variables
   ***/
  $scope.loggedIn = false;
  $scope.errorMsg;
  $scope.realtimeStatus = 0;
  
  /***
   * Purpose: clear the message object
   * Precondition: none
   * Postcondition: message object has been reset
   ***/
  $scope.clearMsg = function() {
    $scope.message = {
      username: $scope.defaultUsername,
      email: 'n/a',
      text: ''
    };
  }
  
  $scope.clearMsg();
  
  /***
   * Purpose: load the existing chat logs
   * Precondition: none
   * Postcondition: chat logs have been loaded
   ***/
  $scope.chatLogs = function() {
    PUBNUB.history( {
      channel : $scope.chatChannel,
      limit   : $scope.messageLimit
    }, function(messages) {
      // Shows All Messages
      $scope.$apply(function(){
        $scope.chatMessages = messages.reverse();          
      }); 
    });
   }
  
  /***
   * Purpose: load the existing chat logs
   * Precondition: none
   * Postcondition: chat logs have been loaded
   ***/
   $scope.attemptLogin = function() {
    $scope.errorMsg = "";
    
    if (!$scope.message.username) {
      $scope.errorMsg = "You must enter a username.";
      return;
    }

    if (!$scope.realtimeStatus) {
      $scope.errorMsg = "You're not connect to PubNub.";
      return;
    }

    $scope.loggedIn = true;
   }

  /***
   * Purpose: remove error message formatting when the message input changes
   * Precondition: none
   * Postcondition: error message class removed from message input
   ***/
  $scope.$watch('message.text', function(newValue, oldValue) {
    if (newValue)
      $("#inputMessage").removeClass("error");
      $scope.errorMsg = "";
  }, true);
  
  /***
   * Purpose: trying to post a message to the chat
   * Precondition: loggedIn
   * Postcondition: message added to chatMessages and sent to chatLog
   ***/
  $scope.postMessage = function() {

    //make sure they are logged in
    if (!$scope.loggedIn) {
      $scope.errorMsg = "You must login first.";
      return;
    }
    
    //make sure they enter a chat message
    if (!$scope.message.text) {
      $scope.errorMsg = "You must enter a message.";
      $("#inputMessage").addClass("error");
      return;
    }
    
    //set the message date
    d = new Date();
    $scope.message.date = d.getDay() + "/" + d.getMonth() + "/" + d.getFullYear();
    $scope.message.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
   
   PUBNUB.publish({
      channel : $scope.chatChannel,
      message : $scope.message
    });

    $scope.message.text = "";
  };
  
  /***
   * Purpose: connect and access pubnub channel
   * Preconditions: pubnub js file init
   * Postconditions: pubnub is waiting and ready
   ***/
  PUBNUB.subscribe({
    channel    : $scope.chatChannel,
    restore    : false, 
    callback   : function(message) { 
      //update messages with the new message
      $scope.$apply(function(){
        $scope.chatMessages.unshift(message);          
      }); 
    },
    
    error      : function(data) {
      $scope.errorMsg = data;
    },
    
    disconnect : function() {   
      $scope.$apply(function(){
        $scope.realtimeStatus = 0;
      });
    },

    reconnect  : function() {   
      $scope.$apply(function(){
        $scope.realtimeStatus = 1;
      });
    },

    connect    : function() {
      $scope.$apply(function(){
        $scope.realtimeStatus = 2;
        //load the chat logs
        $scope.chatLogs();
      });
    }
  });
  
  /***
   * Purpose: trying to post a message to the chat
   * Precondition: loggedIn
   * Postcondition: message added to chatMessages and sent to chatLog
   ***/
  $scope.attemptLogout = function() {
    $("#inputMessage").removeClass("error");
    $scope.clearMsg();
    $scope.loggedIn = false;
  }
}
