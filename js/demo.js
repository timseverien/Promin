$(document).ready(function() {
    $('#form').promin({
        'events': {
            'submit': function() {
                $('#description').hide();
            }
        }
    });

    $('#navigation').click(function() {
        $('#form').promin('next');
    });
});
