const express = require("express")
const router = express.Router()
const cartData = require("../data/carts/index")
const drinks = require("../data/drinks/index")
const helpers = require("../helpers/helpers")

const carts = cartData.carts

router.post("/create-cart", (_, res) => {
  const newId = helpers.generateRandId()
  const newCart = {
    id: newId,
    total: 0,
    items: []
  }
  carts.push(newCart)
  res.json({ ok: true, cart: newCart })
})

router.get("/cart/:id", (req, res) => {
  const { id } = req.params
  const cart = helpers.getValueFromListById(carts, id)
  res.json({ ok: !!cart, cart })
})

router.put("/cart/:id", (req, res) => {
  const { id } = req.params
  const { itemId, qty } = req.body
  const cart = helpers.getValueFromListById(carts, id)

  if (!cart) {
    res.json({ ok: false, message: "Cart does not exist" })
  }

  if (itemId && qty && typeof itemId === "string" && typeof qty === "number" && qty > 0) {
    let newQty = 0
    
    const itemInStock = helpers.getValueFromListById([ ...drinks.juice, ...drinks.beer ], itemId)

    // check if item exists in stock
    if (!itemInStock) {
      res.json({ ok: false, message: `Item with id ${itemId} doesn't exist in stock`})
    } else if (itemInStock.qty < qty) {
      res.json({ ok: false, message: `Sorry, we don't have enough ${itemInStock.name} in stock. Only ${itemInStock.qty} items left of ${itemInStock.name}.`})
    }

    // check if item already exists in cart
    const itemInCart = helpers.getValueFromListById(cart.items, itemId)
    let newItemInCart = {}

    newQty = itemInCart ? itemInCart.qty + qty : qty
  
    if (!itemInStock) {
      res.json({ ok: false, message: `Item with id ${itemId} doesn't exist in stock`})
    } else if (itemInStock.qty < qty) {
      res.json({ ok: false, message: `Sorry, we don't have enough ${itemInStock.name} in stock. Only ${itemInStock.qty} items left of ${itemInStock.name}`})
    }

    if (itemInCart) {
      itemInCart.qty = newQty
    } else {
      newItemInCart.id = itemId
      newItemInCart.qty = qty
      cart.items.push(newItemInCart)
    }

    cart.total += itemInStock.pricePerUnit * qty
    itemInStock.qty -= qty

    // send updated cart
    res.json({ ok: true, cart })
  } else {
    res.json({ ok: false, message: "itemId or qty are incorrect" })
  }
})

router.delete("/cart/:cartId/:itemId", (req, res) => {
  const { cartId, itemId } = req.params
  const cart = helpers.getValueFromListById(carts, cartId)

  if (!cart) {
    res.json({ ok: false, message: `Cart with id ${cartId} does not exist.` })
  }

  const itemInCart = helpers.getValueFromListById(cart.items, itemId)

  if (!itemInCart) {
    res.json({ ok: false, message: `Item with id ${itemId} does not exist in cart with id ${cartId}.` })
  }

  const itemInStock = helpers.getValueFromListById([ ...drinks.juice, ...drinks.beer ], itemId)

  // check if item exists in stock
  if (!itemInStock) {
    res.json({ ok: false, message: `Item with id ${itemId} doesn't exist in stock`})
  }

  let itemIndex
  cart.items.some((item, idx) => {
    if (item.id === itemId) {
      itemIndex = idx
      return true
    }
    return false
  })

  if (itemIndex > -1) {
    itemInStock.qty += itemInCart.qty
    cart.total -= itemInStock.pricePerUnit * itemInCart.qty
    cart.items.splice(itemIndex, 1)
    res.json({ ok: true, cart })
  } else {
    res.json({ ok: false, message: "Couldn't find item in cart." })
  }
})

router.post("/cart/checkout/:id", (req, res) => {
  const { id } = req.params

  const cart = helpers.getValueFromListById(carts, id)

  if (!cart) {
    res.json({ ok: false, message: `Cart with id ${id} does not exist.` })
  }

  let cartIndex
  carts.some((cart, idx) => {
    if (cart.id === id) {
      cartIndex = idx
      return true
    }
    return false
  })

  if (cartIndex > -1) {
    carts.splice(cartIndex, 1)
    res.json({ ok: true, message: `You successfully paid ${Number(cart.total).toFixed(2)}€ for your purchase.` })
  } else {
    res.json({ ok: false, message: "Couldn't find cart." })
  }
})

module.exports = router