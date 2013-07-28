(function () {
    var selector = '[data-weekpicker]', all = [];

    function clearWeekPickers(except) {
        var ii;
        for (ii = 0; ii < all.length; ii++) {
            if (all[ii] != except) {
                all[ii].hide();
            }
        }
    }

    function WeekPicker(element, options) {
        this.$el = $(element);
        this.proxy('show').proxy('ahead').proxy('hide').proxy('keyHandler').proxy('selectWeek');
        var options = $.extend({}, $.fn.weekpicker.defaults, options);

        if ((!!options.parse) || (!!options.format) || !this.detectNative()) {
            $.extend(this, options);
            this.$el.data('weekpicker', this);
            all.push(this);
            this.init();
        }
    }

    WeekPicker.prototype = {
        detectNative:function (el) {
            if (navigator.userAgent.match(/(iPad|iPhone); CPU(\ iPhone)? OS 5_\d/i)) {
                // jQuery will only change the input type of a detached element.
                var $marker = $('<span>').insertBefore(this.$el);
                this.$el.detach().attr('type', 'date').insertAfter($marker);
                $marker.remove();

                return true;
            }

            return false;
        },

        init:function () {
            this.setParams();
            var $nav = $('<div>').addClass('week-nav').append(this.nav(this.months));

            this.calculateDates();

            $calendar = $("<table>").addClass('calendar');
            this.$months = $('<tr>');
            $calendar.append(this.$months);

            this.$picker = $('<div>')
                .click(function (e) {
                    e.stopPropagation();
                })
                // Use this to prevent accidental text selection.
                .mousedown(function (e) {
                    e.preventDefault();
                })
                .addClass('weekpicker')
                .append($nav, $calendar)
                .insertAfter(this.$el);

            this.$el
                .focus(this.show)
                .click(this.show)
                .change($.proxy(function () {
                this.selectWeek();
            }, this));

            this.selectWeek();
            this.hide();
        },

        setParams:function () {
            var data;

            data = this.$el.attr('data-target');
            this.$target = data ? $(data) : this.$el;

            data = parseInt(this.$el.attr('data-months'));
            this.months = data ? data : this.months;

            data = parseInt(this.$el.attr('data-week_start'));
            this.week_start = data ? data : this.week_start;
        },

        selectWeek:function (week) {
            if (typeof(week) == "undefined") {
                week = this.$target.val();
            }

            this.$months.empty();
            this.renderView();

            $('.week', this.$months).click($.proxy(function (e) {
                this.update($(e.target).parent().attr("date"));
            }, this)).hover(function (e) {
                    $('.highlighted', this.$months).removeClass('highlighted');
                    $(this).addClass('highlighted');
                });

            $('.selected', this.$months).removeClass('selected');
            $('[date="' + week + '"]', this.$months).addClass('selected');
        },

        renderView:function () {
            var dates = [
                    [this.rangeStart(this.start), this.mid, 999],
                    [this.mid_next, this.end, 999]
                ],
                thisDay, prevMonth = -1, weekEnd, tmp,
                row, col, label, firstDay, box_class;

            for (var c = 0; c < (this.months <= 1 ? 1 : 2); c++) {
                var m = -1, w = 0;

                dates[c][2] = this.daysBetween(dates[c][0], dates[c][1]);

                $col = $('<td>').addClass('month-col');
                $monthDays = $('<table>');

                //Render head
                $head = $("<tr>").addClass('head');
                $head.append($('<td>'));
                for (var i = 0; i < this.shortDayNames.length; i++) {
                    tmp = $('<td>').addClass('dow');
                    tmp.text(this.shortDayNames[(i + this.week_start) % 7]);
                    $head.append(tmp);
                }
                $monthDays.append($head);

                //Render date cells with month label
                for (var d = 0; d <= dates[c][2]; d++) {
                    thisDay = this.incrementDay(dates[c][0], d);
                    box_class = 'box' + (thisDay.getMonth() % 2);

                    //Creating and append week in to month
                    if (this.week_start == thisDay.getDay()) {
                        firstDay = thisDay;
                        row = $('<tr>').addClass('week');

                        //Print month label
                        if (thisDay.getMonth() != prevMonth) {
                            label = $('<td>');

                            tmp = this.incrementDay(thisDay, 6);
                            if (tmp.getMonth() == thisDay.getMonth()) {
                                tmp = this.incrementDay(thisDay, 28);
                                tmp = (tmp.getMonth() == thisDay.getMonth() ? 5 : 4);
                                label.attr('rowspan', tmp);
                                label.text(this.monthNames[thisDay.getMonth()] + '\n'
                                    + thisDay.getFullYear().toString().substring(2, 4));
                                label.addClass('week-label ' + box_class.replace('box', 'span'));
                            }

                            row.append(label);
                        }

                        //Set week range
                        weekEnd = this.incrementDay(thisDay, 6);
                        row.attr('date', this.formatWeek(thisDay, weekEnd));

                        if (prevMonth != thisDay.getMonth()) {
                            m = m + 1;
                            prevMonth = thisDay.getMonth();
                        }
                    }

                    //Append Day in to Week
                    col = $('<td>').attr('date', this.format(thisDay));
                    col.text(thisDay.getDate());
                    col.addClass(box_class);
                    row.append(col);

                    if (d % 7 == 0) {
                        $monthDays.append(row);
                    }
                }

                $col.append($monthDays);

                this.$months.append($col);
            }
        },

        proxy:function (meth) {
            this[meth] = $.proxy(this[meth], this);
            return this;
        },

        daysBetween:function (start, end) {
            var start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            var end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

            return (end - start) / 86400000;
        },

        findClosest:function (dow, date, direction) {
            var difference = direction * (Math.abs(date.getDay() - dow - (direction * 7)) % 7);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
        },

        rangeStart:function (date) {
            return this.findClosest(this.week_start,
                new Date(date.getFullYear(), date.getMonth()), -1);
        },

        rangeEnd:function (date) {
            return this.findClosest((this.week_start - 1) % 7,
                new Date(date.getFullYear(), date.getMonth() + 1, 0), 1);
        },

        update:function (s) {
            this.$target.val(s);
            this.$el.val(s).change();
        },

        show:function (e) {
            e && e.stopPropagation();

            clearWeekPickers(this);

            var offset = this.$el.offset();

            this.$picker.css({
                top:offset.top + this.$el.outerHeight() + 2,
                left:offset.left
            }).show();

            $('html').on('keydown', this.keyHandler);
        },

        hide:function () {
            this.$picker.hide();
            $('html').off('keydown', this.keyHandler);
        },

        keyHandler:function (e) {
            // Keyboard navigation shortcuts.
            switch (e.keyCode) {
                case 9:
                case 27:
                case 13:
                    this.hide();
                    break;
                default:
                    return;
            }
            e.preventDefault();
        },

        parse:function (s) {
            // Parse a partial RFC 3339 string into a Date.
            var m;
            if ((m = s.match(/^(\d{2,2})\/(\d{2,2})\/(\d{2,2})$/))) {
                return new Date(m[0], m[1] - 1, m[2]);
            } else {
                return null;
            }
        },

        format:function (date) {
            // Format a Date into a string as specified by RFC 3339.
            var month = (date.getMonth() + 1).toString(),
                dom = date.getDate().toString();
            if (month.length === 1) {
                month = '0' + month;
            }

            if (dom.length === 1) {
                dom = '0' + dom;
            }

            return month + "/" + dom + '/' + date.getFullYear().toString().substr(2, 2);
        },

        formatWeek:function (from, to) {
            return this.format(from) + '-' + this.format(to);
        },

        nav:function (months) {
            var $subnav = $('<div>' +
                '<span class="prev button">&larr; Previous </span> | ' +
                ' <span class="next button">Next &rarr;</span>' +
                '</div>');

            $('.prev', $subnav).click($.proxy(function () {
                this.ahead(-months)
            }, this));
            $('.next', $subnav).click($.proxy(function () {
                this.ahead(months)
            }, this));

            return $subnav;
        },

        incrementDay:function (d, i) {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, 12, 00);
        },

        ahead:function (months) {
            var date = new Date(this.start.getFullYear(), this.start.getMonth() + months, 1);
            this.calculateDates(date);
            this.selectWeek();
        },

        calculateDates:function (date) {
            this.start = date ? date : new Date();
            this.mid = this.rangeEnd(new Date(this.start.getFullYear(), this.start.getMonth() + Math.ceil(this.months / 2), 0));
            this.mid_next = new Date(this.mid.getFullYear(), this.mid.getMonth(), this.mid.getDate() + 1);
            this.end = this.rangeEnd(new Date(this.start.getFullYear(), this.start.getMonth() + this.months, 0));
        }
    };

    /* WEEK PICKER DEFINITION
     * ============================ */
    $(document).ready(function () {
        $.fn.weekpicker = function (options) {
            return this.each(function () {
                new WeekPicker(this, options);
            });
        };

        $(function () {
            $(selector).weekpicker();
            $('html').click(clearWeekPickers);
        });

        $.fn.weekpicker.WeekPicker = WeekPicker;

        $.fn.weekpicker.defaults = {
            monthNames:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            shortDayNames:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            week_start:0,
            months:6
        };

    });
}());
