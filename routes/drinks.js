const express = require("express")
const router = express.Router()
const drinks = require("../data/drinks/index")
const helpers = require("../helpers/helpers")

router.get("/drinks", (_, res) => {
  res.json({ ok: true, drinks })
})

router.get("/drinks/:cat", (req, res) => {
  const { cat } = req.params
  const catData = drinks[cat]
  res.json({ ok: !!catData, [cat]: catData })
})

router.get("/drinks/:cat/:id", (req, res) => {
  const { cat, id } = req.params
  const catData = drinks[cat]
  const item = helpers.getValueFromListById(catData, id)
  res.json({ ok: !!item, item })
})

module.exports = router