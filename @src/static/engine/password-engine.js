$(".password--input").keyup(function () {
    if (this.value.length == this.maxLength) {
        var $next = $(this).next('.password--input')
        if ($next.length)
            $(this).next('.password--input').focus()
        else
            $(this).blur()
    } else if (this.value.length == 0) {
        var $prev = $(this).prev('.password--input')
        if ($prev.length)
            $(this).prev('.password--input').focus()
        else
            $(this).blur()
    }
})
