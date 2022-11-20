$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00', //red,brown,organch,organch
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4', //green, d-green, l-green,acrylic
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7' //blue, non-purple, purple, non-pink
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages
  var $inputMessage = $('.inputMessage'); 

  var $loginPage = $('.login.page'); 
  var $chatPage = $('.chat.page'); //Chatroom

  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 buyer";
    } else {
      message += "there are " + data.numUsers + " buyers";
    }
    log(message);
    $('.messages').append('<li class="message show" style="display: list-item;"><span style="color: #000;">Current Bidding @ </span><span class="messageBody">99</span></li>');
  }
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
      socket.emit('add user', username);
    }
  }

  function bid (c) {
    var now = moment().format("DD-M-YYYY, h:mm:ss SSS a");
    // var htmlDateTime =  $.parseHTML(' <i>'+now+'<i>');
    var message =  parseInt(c) + parseInt($('.show:last-child').find('.messageBody').text()) + ' ['+now+']';
    message = cleanInput(message);
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      socket.emit('new message', message);
    }
  }
  function log (message, options) {
    var $el = $('#logs').addClass('log').text(message);
    addMessageElement($el, options);
  }
  function addChatMessage (data, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }
  function addMessageElement (el, options) {
    var $el = $(el);
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $(".messages").each(function(){
         $(this).find('li').hide();
         $(this).find('li').removeClass('show');
         $(this).find('li:last-child').prev('li').andSelf().show();
         $(this).find('li:last-child').prev('li').andSelf().addClass('show');
         $(this).find('li').not('.show').hide();  
      });

    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  function getUsernameColor (username) {
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calc color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  //Added later
  function setTimer(){
    var interval = setInterval(function() {
        var timer = $('#timer').html();
        timer = timer.split(':');
        var minutes = parseInt(timer[0], 10);
        var seconds = parseInt(timer[1], 10);
        seconds -= 1;
        if (minutes < 0) return clearInterval(interval);
        if (minutes < 10 && minutes.length != 2) minutes = '0' + minutes;
        if (seconds < 0 && minutes != 0) {
            minutes -= 1;
            seconds = 59;
        }
        else if (seconds < 10 && length.seconds != 2) seconds = '0' + seconds;
        $('#timer').html(minutes + ':' + seconds);
        
        if (minutes == 0 && seconds == 0)
            clearInterval(interval);
    }, 1000);
  }
  $window.keydown(function (event) {
    // Auto-focus current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // ENTER
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });
  $window.keypress(function(k) {
    // Theoretically button [1-5] should be activated regardless of location on the numpad and in the upper row of keyboard (need dont forget check this)
      switch(k.keyCode)
      {
          // presses "1"
          case 49:  bid(100); 
          break;
              
          // presses "2"
          case 50:  bid(200); 
          break;
          
            // presses "3"
          case 51:  bid(300);
          break;
          
            // presses "4"
          case 52:  bid(400); 
          break;
          
            // presses "5"
          case 53:  bid(500); 
          break;
      }
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome";
    log(message, {
      prepend: true
    }); 
    addParticipantsMessage(data);
    //setTimer();
  });

  // The server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // The server emits 'user joined', log it in the chat body (need check)
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // The server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // The server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });
  // The server emits 'stop typing', kill the typing message (need in 100% check)
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
  socket.on('disconnect', function () {
    log('you have been disconnected');
  });
  socket.on('reconnect', function () {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });
  socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
  });
});