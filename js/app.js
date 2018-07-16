'use strict';
(function($, window, document) {

  $(function() {
    // DOM is ready

    // Initialize major functions
    initScrollToThis();
    formBuilder()
    responsiveVideos();
    pageTransition();

    $("[href='#']").click(function(){return false});

    // Button Hovers
    $('.btn').on('mouseenter', function(e) {
  		var parentOffset = $(this).offset(),
      		relX = e.pageX - parentOffset.left,
      		relY = e.pageY - parentOffset.top;
  		$(this).find('span').css({top:relY, left:relX})
    }).on('mouseout', function(e) {
  		var parentOffset = $(this).offset(),
      		relX = e.pageX - parentOffset.left,
      		relY = e.pageY - parentOffset.top;
      $(this).find('span').css({top:relY, left:relX})
    });

  });

  // Scroll to animate
  function initScrollToThis() {
    $('[data-scroll]').on('click', function(evt) {
      if (this.hash !== '') {
        evt.preventDefault();
        var $target = this.getAttribute('href');
        $('html, body').animate({
          scrollTop: $($target).offset().top
        }, 1000);
        return false
      }
    });
  }

  function responsiveVideos() {
    // Cycle through all videos on the page
    $('video').each(function(index) {
      // Gather their data-source
      var videoSrc = $(this).data('source');

      if (!videoSrc) { return false }
      // Add video source on large screens and up
      // Smaller devices won't download assets
      if ($(window).width() > 1024 ) {
        $(this).append("<source type='video/mp4' src='"+ videoSrc +".mp4.mp4'>");
        $(this).append("<source type='video/webm' src='"+ videoSrc +".webmhd.webm'>");
        $(this).append("<source type='video/ogg' src='"+ videoSrc +".oggtheora.ogv'>");
      }
    });
  }

  function formBuilder() {
    var $messages = $('div[data-type="message"]');
    var $form = $('#mc-embedded-subscribe-form');

    $('.cd-form .cd-email').keyup(function(event) {

      if (event.which != 13) {
        $messages.removeClass('slide-in is-visible');

        $('.cd-form').removeClass('is-submitted').find('.cd-loading').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
      }

      var emailInput = $(this),
        insertedEmail = emailInput.val(),
        atPosition = insertedEmail.indexOf("@"),
        dotPosition = insertedEmail.lastIndexOf(".");

      if (atPosition < 1 || dotPosition < atPosition + 2) {
        $('.cd-form').removeClass('is-active').find('.cd-loading').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
      } else {
        $('.cd-form').addClass('is-active');
      }
    });

    $('.cd-form .cd-email').on('focus', function() {
      $messages.removeClass('slide-in is-visible');
      $('.cd-form').removeClass('is-submitted').find('.cd-loading').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
    });

    //you should replace this part with your ajax function
    $('.cd-submit').on('click', function(event) {
      if ($('.cd-form').hasClass('is-active')) {
        event.preventDefault();

        //show the loading bar and the corrisponding message
        $('.cd-form').addClass('is-submitted').find('.cd-loading').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
          registerForm($form);
        });

        //if transitions are not supported - show messages
        if ($('html').hasClass('no-csstransitions')) {
          registerForm($form);
        }
      }
    });

    if (!Modernizr.input.placeholder) {
      $('[placeholder]').focus(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
          input.val('');
        }
      }).blur(function() {
        var input = $(this);
        if (input.val() == '' || input.val() == input.attr('placeholder')) {
          input.val(input.attr('placeholder'));
        }
      }).blur();
      $('[placeholder]').parents('form').submit(function() {
        $(this).find('[placeholder]').each(function() {
          var input = $(this);
          if (input.val() == input.attr('placeholder')) {
            input.val('');
          }
        })
      });
    }

  }

  function registerForm($form) {
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: $form.serialize(),
      dataType: 'jsonp',
      cache: false,
      error: function(err) {
        $('.cd-response-error').addClass('is-visible');
      },
      success: function(data) {
        if (data.result === 'success') {
          console.log(data.msg)
          $('.cd-response-success').addClass('slide-in');
        } else {
          console.log(data.msg)
          $('.cd-response-notification').addClass('is-visible');
        }
      }
    });
  }

  function pageTransition() {
    var isAnimating = false,
        newLocation = '',
        firstLoad = false;

    //trigger smooth transition from the actual page to the new one
    $('.main').on('click', '[data-type="page-transition"]', function(evt){
      evt.preventDefault();

      //detect which page has been selected
      var newPage = $(this).attr('href');
      console.log(newPage);

      //if the page is not already being animated - trigger animation
      if( !isAnimating ) changePage(newPage, true);

      firstLoad = true;
    });

    //detect the 'popstate' event - e.g. user clicking the back button
    $(window).on('popstate', function() {
    	if( firstLoad ) {
        var newPageArray = location.pathname.split('/'),
          //this is the url of the page to be loaded
          newPage = newPageArray[newPageArray.length - 1];

        if( !isAnimating  &&  newLocation != newPage ) changePage(newPage, false);
      }
      firstLoad = true;
  	});

    function changePage(url, bool) {
      isAnimating = true;
      // trigger page animation
      $('body').addClass('page-is-changing');
      $('.loading-bar').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){

        loadNewContent(url, bool);
        newLocation = url;
        $('.loading-bar').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');

      });

      //if browser doesn't support CSS transitions
      if( !transitionsSupported() ) {
        loadNewContent(url, bool);
        newLocation = url;
      }
    }

    function loadNewContent(url, bool) {
      url = ('' == url) ? 'index.html' : url;
      var newSection = url.replace('.html', '');
      var section = $('<div class="main-content '+newSection+'"></div>');

      section.load(url+' .main-content > *', function(event){
        // load new content and replace <main> content with the new one
        $('.main').html(section);
        // Scroll to top of new page
        $('html, body').scrollTop(0, 0);
        //if browser doesn't support CSS transitions - dont wait for the end of transitions
        var delay = ( transitionsSupported() ) ? 1200 : 0;

        setTimeout(function(){

          $('body').removeClass('page-is-changing');

          $('.loading-bar').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
              isAnimating = false;
            $('.loading-bar').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
          });

          if(url != window.location){
             //add the new page to the window.history
             window.history.pushState({path: url},'',url);
          }

          if( !transitionsSupported() ) isAnimating = false;
        }, delay);
      });
    }

    function transitionsSupported() {
      return $('html').hasClass('csstransitions');
    }
  }

})(window.jQuery, window, document);
