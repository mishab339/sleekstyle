/*=============== SHOW MODAL ===============*/
const showModal = (openButton, modalContent) =>{
    const openBtn = document.getElementById(openButton),
    modalContainer = document.getElementById(modalContent)
    
    if(openBtn && modalContainer){
        openBtn.addEventListener('click', ()=>{
            modalContainer.classList.add('show-modal')
        })
    }
}
showModal('open-modal','modal-container')

/*=============== CLOSE MODAL ===============*/
const closeBtn = document.querySelectorAll('.close-modal')

function closeModal(){
    const modalContainer = document.getElementById('modal-container')
    modalContainer.classList.remove('show-modal')
}
closeBtn.forEach(c => c.addEventListener('click', closeModal))

//===============================================

const OTPinputs = document.querySelectorAll('.otp-inputs')
const button = document.querySelector('.verify-btn')

window.onload = ()=> OTPinputs[0].focus()


OTPinputs.forEach((input)=>{
    input.addEventListener('input', ()=>{
        const currentInput = input
        const nextInput = currentInput.nextElementSibling

        if(currentInput.value.length > 1 && currentInput.value.length == 2){
            currentInput.value = ""
        }


        if(nextInput !== null && nextInput.hasAttribute('disabled') && currentInput.value !== ""){
            nextInput.removeAttribute('disabled')
            nextInput.focus()
        }

        if(!OTPinputs[3].disabled && OTPinputs[3].value !== ""){
            button.classList.add("active")
        }else{
            button.classList.remove('active')
        }
    })

    input.addEventListener('keyup', (e)=>{
        console.log(e);
        if(e.key == "Backspace"){
            if(input.previousElementSibling != null){
                e.target.value = ""
                e.target.setAttribute("disabled", true)
                input.previousElementSibling.focus()
            }
        }
    })
})