
const q=new URLSearchParams(location.search);
document.getElementById('title').innerText=q.get('title');
document.getElementById('frame').src=q.get('src');
