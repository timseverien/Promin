$(document).ready(function() {
    $('.message-submit').hide();

    $('#form').promin({
	'actions': {
            'submit': false
        },

        'events': {
            'submit': function() {
                $('.pm-step').hide();
                $('.message-submit').show();
                $('#description').hide();
            }
        }
    });

    $('#navigation').click(function() {
        $('#form').promin('next');
    });
});
