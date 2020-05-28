$(function () {

  // Content image as background
  $('.ibg').each(function () {
    let url = $(this).children('img').attr('src');
    $(this).css({"background-image":"url(" + url + ")"});
  });

});