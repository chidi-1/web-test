$(document).ready(function () {
    // открыть/закрыть меню
    $('.js--toggle-menu').on('click', function () {
        $('.header').toggleClass('menu-open');
    });

    // прокрутить страницу до элемента меню
    $(".js--page-scroll").on('click', function () {
        let link = $(this);
        $("html, body").animate({
            scrollTop: $(link.attr("href")).offset().top - 60 + "px"
        }, {
            duration: 500
        });
        $('.header').removeClass('menu-open');
        return false;
    });

    // стилизация селекта и скролла в выпадающем меню
    $('.js--select-styler').styler({
        onSelectOpened: function () {
            $(this).find('.jq-selectbox__dropdown').mCustomScrollbar();
        }
    });

    // проверка на заполненность инпута
    $('.inp').blur(function () {
        let input = $(this);
        input.val().length > 0 ?  input.addClass('has-text') : input.removeClass('has-text')
    });

    // слайдер

    const slider = document.getElementById('range');
    const hor_slider_opts = {
        start: 50,
        connect: 'lower',
        direction: 'rtl',
        keyboardSupport: true,
        range: {
            'min': [0, 50],
            '50%': [50, 25],
            'max': [100]
        }
    };
    const vert_slider_opts = {
        start: 33,
        connect: 'lower',
        orientation: 'vertical',
        direction: 'rtl',
        keyboardSupport: true,
        range: {
            'min': [0, 50],
            '33': [50, 25],
            '66': [75, 25],
            'max': [100]
        }
    };

    let window_width = $(window).width();
    check_slider_orientation();

    $(window).resize(function () {
        window_width = $(window).width();
        check_slider_orientation();
    });

    $('.js--set-slider').on('click', function () {
        slider.noUiSlider.set($(this).data('val'));
        return false;
    });

    slider.noUiSlider.on('set', function (values) {
        let slider_val = Number(values[0]);
        $('.js--input-level').val($('.js--set-slider[data-val=' + slider_val + ']').find('span').text());
    });

    function check_slider_orientation() {
        window_width < 480 ?  init_slider(vert_slider_opts) : init_slider(hor_slider_opts);
    }

    function init_slider(opts) {
        if (slider.noUiSlider) {
            slider.noUiSlider.destroy()
        }
        noUiSlider.create(slider, opts);
    }
});
