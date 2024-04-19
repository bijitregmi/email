document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Submit email
  document.querySelector('#compose-form').addEventListener('submit', (e) => {
    e.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: `${document.querySelector('#compose-recipients').value}`,
          subject: `${document.querySelector('#compose-subject').value}`,
          body: `${document.querySelector('#compose-body').value}`
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        if ("error" in result){
          console.log(result);
        }
        else{
          console.log(result);
          load_mailbox('sent');
        }
    });
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      const mails = document.querySelector('#emails-view')

      // Create div for each email
      emails.forEach(email => {
        const new_mail = document.createElement('div');
        new_mail.classList.add('mail');
        if (!email.read) {
          new_mail.classList.toggle('gray');
        }
        new_mail.addEventListener('click', () => get_email(`${email.id}`));
        new_mail.innerHTML = `<div class="sender-sub"><strong>${email.sender}</strong>  ${email.subject}</div>
                              <div class="date">${email.timestamp}</div>`;
        mails.appendChild(new_mail);

      });
  });
}

function get_email(email_id) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Get email data
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Set archive button
      const arch = document.createElement('button');
      arch.id = "arch";

      if (email.archived) {
        arch.innerText = "Unarchive";
        arch.classList.add("btn", "btn-sm", "btn-warning");
      }

      else {
        arch.innerText = "Archive";
        arch.classList.add("btn", "btn-sm", "btn-primary");
      }

      // Set archive status
      arch.addEventListener('click', () => {
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .then(() => {
          load_mailbox('inbox');
        });
      });

      // Show email in view
      const mail = document.querySelector('#email-view');
      mail.innerHTML = `<div class="arch-btn">
                        <strong>From</strong>: ${email.sender}
                        </div>
                        <div><strong>To</strong>: ${email.recipients}</div>
                        <div><strong>Subject</strong>: ${email.subject}</div>
                        <div><strong>Timestamp</strong>: ${email.timestamp}</div>
                        <button id="reply-btn" class="btn btn-sm btn-outline-primary">Reply</button>
                        <hr>
                        <div>${email.body}</div>`;
      document.querySelector('.arch-btn').appendChild(arch);

      // Event for reply button
      const reply = document.querySelector("#reply-btn");
      reply.addEventListener('click', () => reply_mail(`${email.id}`));
  });

  // Set email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function reply_mail(email_id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      if (email.subject.includes("Re:")) {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      }
      else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n\n${email.body}`;
  });
}