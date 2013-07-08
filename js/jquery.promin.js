(function($) {
    var form = null;
    var fields = null;
    var index = -1;
    var shiftIsPressed = false;

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
            'nextOnTab': true,
            'previousOnBackspace': true
        },

        'events': {
            'next': null,
            'previous': null,
            'change': null,
            'submit': null,
            'validate': null
        },

        'labels': {
            'next': 'Next',
            'submit': 'Send'
        }
    };

    var methods = {
        'init': function(opts) {
            $.extend(settings, opts);

            form = this;
            fields = this.find('.pm-steps').children(selectors.join(','));

            if(fields.length === 0) return;

            form.addClass('promin');
            methods.next(true);
        },

        'previous': function(ignoreEvents) {
            if(index <= 0) return;

            if(!ignoreEvents && settings.events.previous) {
                if(!settings.events.previous(index)) return false;
            }

            methods.show(--index, ignoreEvents);
        },

        'next': function(ignoreEvents) {
            if(index >= fields.length - 1) {
                methods.submit();
                return;
            }

            if(!ignoreEvents && settings.events.next) {
                if(!settings.events.next(index)) return false;
            }

            methods.show(++index, ignoreEvents);
        },

        'submit': function() {
            if(!settings.events.validate || (settings.events.validate && settings.events.validate(fields))) {
                if(settings.events.submit) settings.events.submit(fields);
                if(settings.actions.autoSubmit) form.submit();
            }
        },

        'show': function(i, ignoreEvents) {
            if(!ignoreEvents && settings.events.change) {
                if(!settings.events.change(index)) return false;
            }

            index = i;

            fields.unbind().hide();
            var field = fields.eq(i).show();
            var child = field.find('input, select, textarea').unbind();

            if(child.length > 0) {
                child.focus().keydown(methods.keydownHandler)
                child.focus().keyup(methods.keyupHandler);
            } else {
                field.focus().keydown(methods.keydownHandler);
                field.focus().keyup(methods.keyupHandler);
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
                if(e.keyCode === 16) shiftIsPressed = true;

                if(e.keyCode === 9 || (e.keyCode === 13 && e.currentTarget.nodeName.toLowerCase() !== 'textarea')) {
                    if(shiftIsPressed) methods.previous();
                    else methods.next();

                    return false;
                }
            }

            if(settings.actions.previousOnBackspace && $e.val().length === 0 && e.keyCode === 8) {
                methods.previous();
                return false;
            }

            if(settings.actions.cancelOnEscape && e.keyCode === 27) {
                methods.reset();
                return false;
            }
        },

        'keyupHandler': function(e) {
            if(e.keyCode === 16) {
                shiftIsPressed = false;
            }
        }
    };

    $.fn.promin = function(opt) {
        if(methods[opt]) {
            return methods[opt].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof opt === 'object' || !opt) {
            return methods.init.apply(this, arguments);
        }

        return this;
    };
})(jQuery);
