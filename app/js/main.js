$(function () {

  // Content image as background
  $('.ibg').each(function () {
    var url = $(this).children('img').attr('src');
    $(this).css({"background-image":"url(" + url + ")"});
  });

});