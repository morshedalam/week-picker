# [week-picker](http://scripts.morshed-alam.com/week-picker/)

A multi month week picker calendar.

[Demo](http://scripts.morshed-alam.com/week-picker/)


# Example

With default options:

```html
<input data-weekpicker="weekpicker"/>
```

Specifying number of months via data tag:

```html
<input data-weekpicker="weekpicker" data-months="5"/>
```

Specifying start of week via data tag:

```html
<input data-weekpicker="weekpicker" data-week_start="1"/>
```

Specifying target field using icon:

```html
<input type="text" readonly="" id="week_range"/>
<span class="add-on" data-weekpicker="weekpicker" data-target="#week_range">
    <i class="icon-th"></i>
</span>
```

## Data Options
 * Default week start: 0 [0 - Sunday to 6 - Saturday]
 * Default Number of Weeks: 6
 * Target field: self [Can parameterize using data-target="#field_id"]
```

## TO DO
 * Date format support
 * Theme support
 * Language support
 * Inline calendar