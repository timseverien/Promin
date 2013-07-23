(function($) {
    var index = -1;
    var $form, $steps;
    var keys = [];

    var settings = {
        'ajaxCallback': null,

        'actions': {
            'submit': 'default'
        },

        'events': {
            'change': null,
            'next': null,
            'previous': null,
            'submit': null,
            'reset': null
        },

        'shortcuts': {
            'next': [9, 13],
            'previous': [[9, 16]],
            'reset': [27]
        }
    };

    var methods = {
        'next': function(ignoreEvents) {
            var next = index + 1;

            if(pmethods.eventIsSet('next', ignoreEvents)) {
                if(settings.events.next.call(this, next) === false) return;
            }

            if(next === $steps.length) methods.submit();
            else methods.show(next);
        },

        'previous': function(ignoreEvents) {
            var next = index - 1;

            if(pmethods.eventIsSet('previous', ignoreEvents)) {
                if(settings.events.next.call(this, next) === false) return;
            }

            if(next < 0) return;
            methods.show(next);
        },

        'show': function(i, ignoreEvents) {
            var step, field;

            if(pmethods.eventIsSet('previous', ignoreEvents)) {
                if(settings.events.previous.call(this, i) === false) return;
            }

            step = $steps.eq(index);
            field = pmethods.getField(step);

            step.hide();
            field.blur();

            if(i < $steps.length) {
                step = $steps.eq(i);
                field = pmethods.getField(step);

                step.show();
                field.focus();
            }

            index = i;
        },

        'submit': function(ignoreEvents) {
            if(pmethods.eventIsSet('submit', ignoreEvents)) {
                var fields = $steps.find('input, textarea, select');
                if(settings.events.submit.call(this, fields) === false) return;
            }

            if(settings.actions.submit && settings.actions.submit === 'default') {
                $form.submit();
            } else if(settings.actions.submit && settings.actions.submit === 'ajax') {
                var url = $form.attr('action');
                var fields = {'ajax': true};

                $form.find('input, textarea, select').each(function(i, e) {
                    var name = $(e).attr('name');
                    var value = $(e).val();

                    if(typeof name === 'string' && name.length <= 0) return;

                    fields[name] = value;
                });

                $.ajax({
                    'cache': false,
                    'complete': settings.ajaxCallback,
                    'data': fields,
                    'type': 'POST',
                    'url': url
                });
            }
        },

        'reset': function(ignoreEvents) {
            methods.show(0);

            $steps.find('input').each(pmethods.resetInput);
            $steps.find('textarea').each(pmethods.resetTextarea);
            $steps.find('select').each(pmethods.resetSelect);

            if(pmethods.eventIsSet('reset', ignoreEvents)) {
                settings.events.reset.call(this);
            }
        }
    };

    var pmethods = {
        'init': function(opt) {
            $.extend(settings, opt);

            $form = this;
            $steps = this.find('.pm-step');
            $form.addClass('promin');

            $steps.hide().each(function(i, e) {
                var $e = $(e);
                var field = pmethods.getField($e);
                field.keydown(pmethods.keydownHandler);
                field.keyup(pmethods.keyupHandler);
            });

            if($steps.length > 0) {
                methods.show(0);
            }
        },

        'keydownHandler': function(e) {
            keys.push(e.keyCode);

            if(!settings.shortcuts) return;

            if(settings.shortcuts.next && settings.shortcuts.next.length > 0 && pmethods.keydown.apply(null, settings.shortcuts.next)) {
                methods.next();
                return false;
            }

            if(settings.shortcuts.previous && settings.shortcuts.previous.length > 0 && pmethods.keydown.apply(null, settings.shortcuts.previous)) {
                methods.previous();
                return false;
            }

            if(settings.shortcuts.reset && settings.shortcuts.reset.length > 0 && pmethods.keydown.apply(null, settings.shortcuts.reset)) {
                methods.reset();
                return false;
            }
        },

        'keyupHandler': function(e) {
            var i = keys.length;

            while(i--) {
                if(keys[i] === e.keyCode) {
                    keys.splice(i, 1);
                }
            }
        },

        'keydown': function() {
            var keysdown = false;

            $.each(arguments, function(i, keyset) {
                if(typeof keyset === 'number') {
                    if(keys.length !== 1) return;

                    if($.inArray(keyset, keys) >= 0) {
                        keysdown = true;
                        return false;
                    }
                } else {
                    if(keyset.length !== keys.length) return;

                    var equal = 0;

                    $.each(keyset, function(i, key) {
                        if($.inArray(key, keys) >= 0) equal++;
                    });

                    if(equal === keyset.length) {
                        keysdown = true;
                        return false;
                    }
                }
            });

            return keysdown;
        },

        'resetInput': function(i, e) {
            var $e = $(e);
            $e.val($e.attr('value'));
        },

        'resetTextarea': function(i, e) {
            var $e = $(e);
            $e.val($e.html());
        },

        'resetSelect': function(i, e) {
            var $e = $(e);
            var val = $e.find('option[selected]').attr('value');
            $e.val(val);
        },

        'getField': function(e) {
            var tag = e.prop('nodeName').toLowerCase();
            var desc = e.find('input, textarea, select');

            if(tag === 'input' || tag === 'textarea' || tag === 'select') return tag;
            return desc;
        },

        'eventIsSet': function(name, ignoreEvents) {
            return (!ignoreEvents && settings.events && settings.events[name] && typeof settings.events[name] === 'function');
        }
    };

    $.fn.promin = function(opt) {
        if(methods[opt]) {
            return methods[opt].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof opt === 'object' || !opt) {
            return pmethods.init.apply(this, arguments);
        }

        return this;
    };
})(jQuery);
