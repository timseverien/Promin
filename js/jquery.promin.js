(function($) {
    var form = null;
    var fields = null;
    var index = -1;

    var selectors = [
        'input[type=color]',
        'input[type=date]',
        'input[type=datetime]',
        'input[type=datetime-local]',
        'input[type=email]',
        'input[type=file]',
        'input[type=month]',
        'input[type=number]',
        'input[type=password]',
        'input[type=range]',
        'input[type=search]',
        'input[type=tel]',
        'input[type=time]',
        'input[type=text]',
        'input[type=url]',
        'input[type=week]',
        'textarea',
        'select',
        '.pm-step'
    ];

    var settings = {
        'button': null,

        'actions': {
            'autoSubmit': true,
            'cancelOnEscape': true,
            'nextOnTab': true
        },

        'events': {
            'next': null,
            'previous': null,
            'submit': null,
            'validate': null
        },

        'labels': {
            'next': 'Next',
            'submit': 'Send'
        }
    };

    var methods = {
        'init': function() {
            form = this;
            fields = this.find('.pm-steps').children(selectors.join(','));

            // abort
            if(fields.length === 0) return;

            form.addClass('promin');
            methods.next();
        },

        'previous': function() {
            methods.show(--index);

            if(settings.events.previous) {
                settings.events.previous(index);
            }
        },

        'next': function() {
            methods.show(++index);

            if(settings.events.next) {
                settings.events.next(index);
            }
        },

        'submit': function() {
            if(!settings.events.validate || (settings.events.validate && settings.events.validate(fields))) {
                if(settings.events.submit) settings.events.submit(fields);
                if(settings.actions.autoSubmit) form.submit();
            }
        },

        'show': function(i) {
            index = i; // make sure index is correct

            if(i >= fields.length) {
                methods.submit();
                return;
            }

            fields.hide().unbind();
            var field = fields.eq(i).show();
            var child = field.find('input, select, textarea');

            if(child.length > 0) {
                child.focus().keydown(methods.keydownHandler)
            } else {
                field.focus().keydown(methods.keydownHandler);
            }

            if(settings.button) {
                if(i < fields.length - 1) {
                    settings.button.val(settings.labels.next);
                    settings.button.unbind().click(methods.next);
                } else {
                    settings.button.val(settings.labels.submit);
                    settings.button.addClass('submit');
                    settings.button.unbind().click(methods.submit);
                }
            }
        },

        'reset': function() {
            fields.each(function(i, el) {
                var $el = $(el);
                var node = $el.prop('tagName').toLowerCase();

                if(node === 'div') {
                    $el = $(el).find('input, textarea, select');
                    node = $el.prop('tagName').toLowerCase();
                }

                if(node === 'input') {
                    $el.val($el.attr('value'));
                } else if(node === 'textarea') {
                    $el.val($el.html());
                } else if(node === 'select') {
                    $el.val($el.find('option[selected]').attr('value'));
                }
            });

            methods.show(0);
        },

        'keydownHandler': function(e) {
            var $e = $(e.currentTarget);

            if(settings.actions.nextOnTab) {
                if(e.keyCode === 9 || (e.keyCode === 13 && e.currentTarget.nodeName.toLowerCase() !== 'textarea')) {
                        methods.next();
                        return false;
                }
            }

            if(settings.actions.cancelOnEscape && e.keyCode === 27) {
                methods.reset();
                return false;
            }

            if($e.val().length === 0 && e.keyCode === 8) {
                methods.previous();
                return false;
            }
        }
    };

    $.fn.promin = function(a, b) {
        if(typeof a === 'string' && methods.hasOwnProperty(a)) {
            if(!b) methods[a].call(this);
            else methods[a].call(this, b);
        } else if(typeof a === 'object') {
            $.extend(settings, a);
            methods.init.call(this);
        } else if(!a) {
            methods.init.call(this);
        }

        return this;
    };
})(jQuery);
