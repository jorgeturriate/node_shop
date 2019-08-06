const deleteProduct= (btn)=>{
    const prodId= btn.parentNode.querySelector('[name=productId]').value;
    const csrf= btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement= btn.closest('article');

    fetch('/admin/product/'+prodId,{
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(result=>{
            return result.json();
        })
        .then(data=>{
            console.log(data);

            //productElement.remove();
            productElement.parentNode.removeChild(productElement); //works in all browsers

            //reload the page in 2 seconds and restore pagination to it's normal state
            setTimeout(function(){
                location.reload();
            }, 2000);//reload after 2000 milliseconds or 2 seconds

        })
        .catch(err=>{
            console.log(err);
        });
};