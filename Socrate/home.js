let installPrompt;
const installBtn=document.querySelector('#installBtn');
addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;installBtn.classList.add('show')});
installBtn.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.classList.remove('show')});
addEventListener('appinstalled',()=>say('Socrate ad Atene è stato installato'));
