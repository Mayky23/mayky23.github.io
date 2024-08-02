


// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });
});

// navbar toggle
$('#nav-toggle').click(function(){
    $(this).toggleClass('is-active')
    $('ul.nav').toggleClass('show');
});

// PDF CV download
function openPDF() {
    var pdfWindow = window.open('', '_blank');
    pdfWindow.document.write("<iframe width='100%' height='100%' src='CV_mardh.pdf'></iframe>");
  }

// Open LInkedIn
function openLinkedIn() {
    window.open('https://www.linkedin.com/in/mardh', '_blank');
}

const btn = document.getElementById('button');

document.getElementById('contact-form')
.addEventListener('submit', function(event) {
    event.preventDefault();

    btn.value = 'Sending...';

    const serviceID = 'service_ew8tegd';
    const templateID = 'template_czltfmj';

    emailjs.sendForm(serviceID, templateID, this)
    .then(() => {
        btn.value = 'Send Email';
        alert('Sent!');
    }, (err) => {
        btn.value = 'Send Email';
        alert(JSON.stringify(err));
    });
});

// Button visit my work
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }