// This file contains the implementation of a modal component, including functions for opening, closing, and rendering the modal.

class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeButton = this.modal.querySelector('.close');
        this.init();
    }

    init() {
        this.closeButton.addEventListener('click', () => this.close());
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
    }

    open() {
        this.modal.style.display = 'block';
    }

    close() {
        this.modal.style.display = 'none';
    }

    setContent(content) {
        const contentContainer = this.modal.querySelector('.modal-content');
        contentContainer.innerHTML = content;
    }
}

// Export the Modal class for use in other parts of the application
export default Modal;