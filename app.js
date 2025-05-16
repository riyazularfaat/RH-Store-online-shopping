document.addEventListener("DOMContentLoaded", () => {

  setupMobileMenu()
  fetchProducts()
  setupContactForm()
  setupCart()
})


function setupMobileMenu() {
  
  if (!document.querySelector(".menu-toggle")) {
    const navbar = document.querySelector(".navbar")
    const navMenu = navbar.querySelector("ul")

    const menuToggle = document.createElement("div")
    menuToggle.className = "menu-toggle"
    menuToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `

    navbar.insertBefore(menuToggle, navbar.firstChild)

    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })

    
    const navLinks = navMenu.querySelectorAll("a")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
      })
    })
  }
}

function fetchProducts() {
  const productsContainer = document.getElementById("products-container")
  fetch("https://riyazularfaat.github.io/RH-Store/api.json")
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      productsContainer.innerHTML = ""

      displayProducts(data, productsContainer)
    })
}

const cart = {
  items: [],
  subtotal: 0,
  shipping: 0,
  delivery: 0,
  discount: 0,

  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        ...product,
        quantity,
      })
    }

    this.updateTotals()
    this.updateUI()
  },

  removeItem(productId) {
    const index = this.items.findIndex((item) => item.id === productId)

    if (index !== -1) {
      this.items.splice(index, 1)
      this.updateTotals()
      this.updateUI()
    }
  },

  updateQuantity(productId, change) {
    const item = this.items.find((item) => item.id === productId)

    if (item) {
      item.quantity += change

      if (item.quantity <= 0) {
        this.removeItem(productId)
      } else {
        this.updateTotals()
        this.updateUI()
      }
    }
  },

  updateTotals() {
    this.subtotal = this.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    this.discount = this.subtotal >= 500 ? this.subtotal * 0.1 : 0
    this.shipping = this.items.length >= 5 ? 15 : 10
    this.delivery = this.items.length >= 3 && this.subtotal >= 250 ? 5 : 10

    this.total = this.subtotal + this.shipping + this.delivery - this.discount
  },

  updateUI() {
    const cartCountElements = document.querySelectorAll(".cart-count")
    const totalItems = this.items.reduce((count, item) => count + item.quantity, 0)

    cartCountElements.forEach((element) => {
      element.textContent = totalItems
    })

    const cartItemsContainer = document.querySelector(".cart-items")

    if (cartItemsContainer) {
      if (this.items.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>'
      } else {
        cartItemsContainer.innerHTML = ""

        this.items.forEach((item) => {
          const cartItem = document.createElement("div")
          cartItem.className = "cart-item"

          cartItem.innerHTML = `
                          <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                          <div class="cart-item-details">
                              <h4 class="cart-item-title">${item.title}</h4>
                              <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                          </div>
                          <div class="cart-item-quantity">
                              <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                              <span class="quantity-value">${item.quantity}</span>
                              <button class="quantity-btn increase" data-id="${item.id}">+</button>
                          </div>
                      `

          cartItemsContainer.appendChild(cartItem)
        })

        const decreaseButtons = cartItemsContainer.querySelectorAll(".decrease")
        const increaseButtons = cartItemsContainer.querySelectorAll(".increase")

        decreaseButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const productId = Number.parseInt(e.target.dataset.id)
            this.updateQuantity(productId, -1)
          })
        })

        increaseButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const productId = Number.parseInt(e.target.dataset.id)
            this.updateQuantity(productId, 1)
          })
        })
      }
    }

    document.querySelector(".subtotal").textContent = `$${this.subtotal.toFixed(2)}`
    document.querySelector(".shipping").textContent = `$${this.shipping.toFixed(2)}`
    document.querySelector(".delivery").textContent = `$${this.delivery.toFixed(2)}`
    document.querySelector(".discount").textContent = `-$${this.discount.toFixed(2)}`
    document.querySelector(".total-price").textContent = `$${this.total.toFixed(2)}`

    document.querySelector(".sidebar-subtotal").textContent = `$${this.subtotal.toFixed(2)}`
    document.querySelector(".sidebar-shipping").textContent = `$${this.shipping.toFixed(2)}`
    document.querySelector(".sidebar-delivery").textContent = `$${this.delivery.toFixed(2)}`
    document.querySelector(".sidebar-discount").textContent = `-$${this.discount.toFixed(2)}`
    document.querySelector(".sidebar-total").textContent = `$${this.total.toFixed(2)}`
  },
}

function setupCart() {
  const checkoutButtons = document.querySelectorAll(".checkout-btn")

  checkoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (cart.items.length === 0) {
        const message = "The cart is empty. Please add items to the cart before checking out."
        showNotification(message)
      } else {
        const message = "Thank you for your order! This is a demo, so no actual payment will be processed."
        showNotification(message)
        cart.items = []
        cart.updateTotals()
        cart.updateUI()
      }
    })
  })
}

function displayProducts(products, container) {
  products.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.className = "product-card"
    const stars = generateStars(product.rating)

    productCard.innerHTML = `
              <img src="${product.image}" alt="${product.title}" class="product-image">
              <div class="product-info">
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-description">${product.description}</p>
                  <div class="product-price-rating">
                      <p class="product-price">$${product.price.toFixed(2)}</p>
                      <p class="product-rating">${stars} ${product.rating.toFixed(1)}</p>
                  </div>
                  <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
              </div>
          `

    container.appendChild(productCard)

    const addToCartBtn = productCard.querySelector(".add-to-cart-btn")
    addToCartBtn.addEventListener("click", () => {
      cart.addItem(product)

      showNotification(`${product.title} added to cart!`)
    })
  })
}

function generateStars(rating) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  let starsHTML = ""

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>'
  }

  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>'
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>'
  }

  return starsHTML
}

function showNotification(message) {
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => {
    document.body.removeChild(notification)
  })

  const notification = document.createElement("div")
  notification.className = "notification"
  notification.textContent = message

  notification.style.position = "fixed"
  notification.style.bottom = "20px"
  notification.style.right = "20px"
  notification.style.backgroundColor = "#4F46E5"
  notification.style.color = "white"
  notification.style.padding = "10px 20px"
  notification.style.borderRadius = "5px"
  notification.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"
  notification.style.zIndex = "1000"
  notification.style.opacity = "0"
  notification.style.transform = "translateY(20px)"
  notification.style.transition = "opacity 0.3s, transform 0.3s"

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = "1"
    notification.style.transform = "translateY(0)"
  }, 10)

  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transform = "translateY(20px)"

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

function setupContactForm() {
  const contactForm = document.querySelector(".contact-form form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const name = contactForm.querySelector('input[type="text"]').value
      const email = contactForm.querySelector('input[type="email"]').value
      const message = contactForm.querySelector("textarea").value

      if (!name || !email || !message) {
        alert("Please fill in all fields")
        return
      }

      alert(`Thank you for your message, ${name}! We will get back to you soon.`)

      contactForm.reset()
    })
  }
}
