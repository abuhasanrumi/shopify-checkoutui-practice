import { useEffect, useRef, useState } from "react";
import { extend, render, useExtensionInput, BlockStack, Button, CalloutBanner, Heading, Image, Text, TextContainer, Separator, Tiles, TextBlock, Layout, Banner, Bookend, ButtonGroup, TextField, View, InlineStack, VisuallyHidden, Select } from "@shopify/post-purchase-ui-extensions-react";
import getSymbolFromCurrency from "currency-symbol-map";

const APP_URL = "https://dinamatic-post-purcahse.herokuapp.com";

extend("Checkout::PostPurchase::ShouldRender", async ({ inputData, storage }) => {
  const shopURL = inputData.shop.domain
  let postPurchaseOffer
  try {
    // const res = await fetch(`${APP_URL}/api/post-purchase-offer?shop-url=${shopURL}`, {
    const res = await fetch(`${APP_URL}/api/post-purchase-offer?shop-url=${shopURL}`, {
      // const res = await fetch('https://consequences-expectations-sustained-poems.trycloudflare.com/posts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        token: inputData.token,
      })
    })
    if (res.status !== 200) throw new Error('Something went wrong!')
    postPurchaseOffer = await res.json()
  } catch (e) {
    return { render: false };
  }

  const products = []
  for (let i = 0; i < postPurchaseOffer.offer_page; i++) {
    postPurchaseOffer?.offer?.[`page_${i + 1}`].map(j => j?.data.map(k => products.push(k)))
  }

  await storage.update(JSON.stringify({ offers: products, products: postPurchaseOffer }));
  return { render: true };
});

render("Checkout::PostPurchase::Render", () => <App />);

export function App() {
  const { storage, inputData, calculateChangeset, applyChangeset, done } = useExtensionInput();
  const [loading, setLoading] = useState(true);
  const [calculatedPurchase, setCalculatedPurchase] = useState();
  const offerCount = useRef(0)
  const [purchaseOptionNumber, setPurchaseOptionNumber] = useState(0)
  const [purchaseOption, setPurchaseOption] = useState(JSON.parse(storage.initialData).offers[purchaseOptionNumber])
  const [productCount, setProductCount] = useState(purchaseOption?.changes?.at(0)?.quantity)
  const [productVariant, setProductVariant] = useState(purchaseOption?.changes?.at(0)?.variantID)
  const [originalDiscount, setOriginalDiscount] = useState(purchaseOption?.changes?.at(0)?.discount?.value)
  const [productsCount, setProductsCount] = useState()
  const [firstTimeProductsCount, setFirstTimeProductsCount] = useState(true)
  // had to use this so that useEffect does not change productVariant upon purchaseOption change
  const [productID, setProductID] = useState()
  const [pageNumber, setPageNumber] = useState(1)
  const [purchaseCount, setPurchaseCount] = useState(0)
  const productPerPage = 4
  // const [productVariants, setProductVariants] = useState([])
  const productVariants = useRef()
  const currencyCode = inputData.initialPurchase.totalPriceSet.presentmentMoney.currencyCode
  const specificPurchaseId = inputData.initialPurchase.referenceId
  const productToBeShown = JSON.parse(storage.initialData).products.template === 'single' ? 1 : 2
  const bundle = false

  // these are for multiple products
  const [products, setProducts] = useState(JSON.parse(storage.initialData).offers)
  const [changesForMultipleProducts, setChangesForMultipleProducts] = useState([])
  const [productsBought, setProductsBought] = useState([])
  const [productsVariants, setProductsVariants] = useState([])
  const [declinedProducts, setDeclinedProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState([])
  const [selectedVariants, setSelectedVariants] = useState([])
  const [totalPriceForMultipleProduct, setTotalPriceForMultipleProduct] = useState(0)

  // for bundle products
  const [bundleProducts, setBundleProducts] = useState([])
  const [bundleChanges, setBundleChanges] = useState({})
  const [bundleChangeset, setBundleChangeset] = useState({})
  const [bundleTotal, setBundleTotal] = useState()
  const [bundleDiscount, setBundleDiscount] = useState()
  const [bundleTax, setBundleTax] = useState()
  const [bundleDescription, setBundleDescription] = useState('')
  const [bundleOff, setBundleOff] = useState(0)
  const [bundleTime, setBundleTime] = useState()
  const [timeLeft, setTimeLeft] = useState()
  const [tempTimeLeft, setTempTimeLeft] = useState()
  const [timeRightNow, setTimeRightNow] = useState()


  // new states. although I could use the old states and effets but those will produce new bugs. sorry for your inconvenience
  const [offerProducts, setOfferProducts] = useState([])
  const [firstPageFirstOffer, setFirstPageFirstOffer] = useState([])
  const [firstPageSecondOffer, setFirstPageSecondOffer] = useState([])
  const [secondPageFirstOffer, setSecondPageFirstOffer] = useState([])
  const [secondPageSecondOffer, setSecondPageSecondOffer] = useState([])
  const [firstPageFirstOff, setFirstPageFirstOff] = useState({})

  // multiple change sets
  const [firstPageFirstChangeset, setFirstPageFirstChangeset] = useState({})
  const [firstPageSecondChangeset, setFirstPageSecondChangeset] = useState({})
  const [secondPageFirstChangeset, setSecondPageFirstChangeset] = useState({})
  const [secondPageSecondChangeset, setSecondPageSecondChangeset] = useState({})
  const [time, setTime] = useState(300)
  const [newTime, setNewTime] = useState(false)

  const [productsQuntity, setProdutsQuantity] = useState([])
  const [multipleBought, setMultipleBought] = useState([])
  const shopURL = inputData.shop.domain

  useEffect(() => {
    setTimeRightNow(Date.now())
  }, [])

  useEffect(() => {
    // const newProducts = JSON.parse(storage.initialData).offers
    // console.log(JSON.parse(storage.initialData).products)
    if (pageNumber === 1) {
      const firstPageProducts = JSON.parse(storage?.initialData)?.products?.offer[`page_${pageNumber}`]
      // console.log(firstPageProducts)
      setFirstPageFirstOffer(firstPageProducts[0]?.data)
      setFirstPageSecondOffer(firstPageProducts[1]?.data)
      // const slicedProducts = newProducts.slice(0, productPerPage)
      // setProducts(slicedProducts)
    } else {
      const secondPageProducts = JSON.parse(storage?.initialData)?.products?.offer[`page_${pageNumber}`]
      setSecondPageFirstOffer(secondPageProducts[0]?.data)
      setSecondPageSecondOffer(secondPageProducts[1]?.data)
      // const slicedProducts = newProducts.slice(productPerPage, newProducts.length)
      // setProducts(slicedProducts)
    }
  }, [pageNumber])

  // changes the quantity
  // calculates the change set after getting the products
  // console.log(firstPageFirstChangeset?.totalOutstandingSet?.presentmentMoney?.amount)
  useEffect(() => {
    const firstOfferForFirstPage = []
    const secondOfferForFirstPage = []
    const firstOfferForSecondPage = []
    const secondOfferForSecondPage = []
    firstPageFirstOffer?.map(i => i.changes?.map(j => firstOfferForFirstPage.push(j)))
    firstPageSecondOffer?.map(i => i.changes?.map(j => secondOfferForFirstPage.push(j)))
    secondPageFirstOffer?.map(i => i.changes?.map(j => firstOfferForSecondPage.push(j)))
    secondPageSecondOffer?.map(i => i.changes?.map(j => secondOfferForSecondPage.push(j)))
    if (firstOfferForFirstPage.length) {
      calculateChangeset({
        changes: firstOfferForFirstPage
      })
        .then(data => setFirstPageFirstChangeset(data.calculatedPurchase))
    }

    if (secondOfferForFirstPage.length) {
      calculateChangeset({
        changes: secondOfferForFirstPage
      })
        .then(data => setFirstPageSecondChangeset(data.calculatedPurchase))
    }

    if (firstOfferForSecondPage.length) {
      calculateChangeset({
        changes: firstOfferForSecondPage
      })
        .then(data => setSecondPageFirstChangeset(data.calculatedPurchase))
    }

    if (secondOfferForSecondPage.length) {
      calculateChangeset({
        changes: secondOfferForSecondPage
      })
        .then(data => setSecondPageSecondChangeset(data.calculatedPurchase))
    }
    // const shipping = calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount;
    // const taxes = calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
    // const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
    // const discountedPrice = calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney.amount;
    // const originalPrice = calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

    // console.log('firstOffer', firstOffer)
    // console.log(firstPageFirstOffer, firstPageSecondOffer, secondPageFirstOffer, secondPageSecondOffer)
    // console.log('firstPageFirstOffer', firstPageFirstOffer)
    // const response = calculateChangeset({

    // })
  }, [firstPageFirstOffer, firstPageSecondOffer, secondPageFirstOffer, secondPageSecondOffer])

  useEffect(() => {
    setTempTimeLeft(bundleTime - timeRightNow)
  }, [bundleTime, timeRightNow])

  useEffect(() => {
    if (purchaseCount > 1) {
      done()
    }
  }, [purchaseCount])

  function decreaseTime() {
    const minute = Number(tempTimeLeft / 1000 / 60).toString().split('.')[0]
    const second = Number(tempTimeLeft / 1000 % 60).toFixed()

    return `${Number(minute) <= 0 ? 0 : minute}:${second.length === 1 ? `0${second}` : Number(second) <= 0 ? '00' : second}`
  }

  // console.log(time)
  useEffect(() => {
    let tempTime = time
    setTime(state => state - 1)
    const timer = setInterval(() => {
      if (tempTime > 1) {
        setTime(state => state - 1)
        tempTime--
      }
    }, 1000)
    const clearTimer = setTimeout(() => clearInterval(timer), 300 * 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(clearTimer)
    }
    // if (tempTimeLeft <= 0) done()

    // const timer = setInterval(() => { setTimeLeft(decreaseTime() || '-:--'); setTimeRightNow(Date.now()) }, 1000)
    // const removeTimer = setTimeout(() => { clearInterval(timer) }, tempTimeLeft + 2000)

    // return () => {
    //   clearInterval(timer)
    //   clearTimeout(removeTimer)
    // }
  }, [newTime])

  useEffect(() => {
    if (pageNumber === 1) {
      if (time <= 0) {
        setPageNumber(2)
        setTime(10)
        setNewTime(true)
      }
    } else {
      if (time <= 0) done()
    }
  }, [time, pageNumber])

  useEffect(() => {
    if (productToBeShown !== 1 && bundle) {
      fetch(`${APP_URL}/api/bundle-offer`, {
        // const postPurchaseOffer = await fetch(`https://7587-115-127-46-145.ngrok-free.app/api/post-purchase-offers.php?shop_url=${shopURL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId: inputData.initialPurchase.referenceId,
          token: inputData.token,
        }),
      })
        .then((response) => response.json())
        .then(data => {
          const offs = []
          JSON.parse(data).offers.map(i => i.changes.map(j => offs.push(j.discount.value)))
          // this checks whether every discount is same or not
          if (offs.every((i, _, arr) => i === arr[0])) setBundleOff(offs[0])
          setBundleProducts(JSON.parse(data).offers)
          setBundleDescription(JSON.parse(data).description)
          setBundleTime(JSON.parse(data).time)
        })
    }
  }, [])

  useEffect(() => {
    if (bundle) {
      const changes = []
      JSON.parse(JSON.stringify(bundleProducts)).map(i => i.changes.map(j => changes.push(j)))
      changes.map(i => delete i.title)
      setBundleChanges(changes)
    }
  }, [bundleProducts])

  useEffect(() => {
    if (bundleChanges.length) {
      calculateChangeset({
        changes: bundleChanges
      }).then(res => setBundleChangeset(res))
    }
  }, [bundleChanges])

  useEffect(() => {
    if (bundleChanges.length) {
      let discount = 0
      bundleChangeset?.calculatedPurchase.updatedLineItems.map(i => discount += Number(i.totalPriceSet.presentmentMoney.amount))
      setBundleDiscount(Number(discount).toFixed(2))
      setBundleTax(Number(bundleChangeset?.calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount).toFixed(2))
    }
  }, [bundleChangeset])

  // sets bundle total when bundle discount and bundle tax is ready
  useEffect(() => {
    if (bundleDiscount, bundleTax) setBundleTotal(Number(Number(bundleDiscount) + Number(bundleTax)).toFixed(2))
  }, [bundleDiscount, bundleTax])

  // sets quantity count(retrieved from backend) for multiple products in the first run
  useEffect(() => {
    setLoading(true)

    if (firstTimeProductsCount && productToBeShown !== 1) {
      setFirstTimeProductsCount(false)
      const newProducts = JSON.parse(JSON.stringify(products))
      const newProductsCount = []
      const variants = []

      newProducts.map(i => {
        i.changes.map(j => delete j.title)
        const countObject = {}
        countObject[i.id] = i.changes[0].quantity
        newProductsCount.push(countObject)

        const variant = { id: i.id, value: i.changes[0].variantID }
        variants.push(variant)
      })

      setProductsCount(newProductsCount)
      setProductsVariants(variants)
    }

    if (products && productToBeShown !== 1 && !bundle) {
      const changesArray = []
      // can not take any risks as variant title is being deleted
      const newProducts = structuredClone(products)

      // https://stackoverflow.com/a/71970498
      Promise.all(newProducts.map(async i => {
        // have to delete title from every variants or else shopify will return error
        i.changes.map(k => delete k.title)
        const productVariant = productsVariants.find(k => k.id === i.id)
        const changes = i.changes.find(k => k.variantID === productVariant?.value)

        const result = await calculateChangeset({ changes: [changes] })
        changesArray.push(result)
      }))
        .then(() => {
          setChangesForMultipleProducts(changesArray)
          setLoading(false)
        })
    }
  }, [products, productsVariants])

  // useEffect(() => {
  //   let total = 0
  //   // selects which products are selected from changes
  //   const filteredSelectedProducts = changesForMultipleProducts.filter(i => selectedProduct.includes(i?.calculatedPurchase?.updatedLineItems?.at(0)?.productId))
  //   // console.log(filteredSelectedProducts)
  //   filteredSelectedProducts.map(i => console.log(i))
  //   // filteredSelectedProducts.map(i => )
  //   // changesForMultipleProducts.map(i => console.log(i))
  //   // setTotalPriceForMultipleProduct(Number(total).toFixed(2))
  //   console.log(total)
  // }, [changesForMultipleProducts, selectedProduct])
  // console.log('changes for multiple', changesForMultipleProducts)

  // useEffect(() => {
  //   if (products.length) {
  //     if (productsBought.length === 1 && pageNumber === 1) setPageNumber(2)
  //     if (productsBought.length > 1) done()
  //     if (products.length === productsBought.length) done()
  //     if (products.length === productsBought.length + declinedProducts.length) done()
  //   }
  // }, [products, productsBought, declinedProducts])

  useEffect(() => {
    // console.log(selectedProduct, productsVariants)
    const newProductsVariants = productsVariants.filter(i => selectedProduct.includes(i.id))
    const variants = []
    newProductsVariants.map(i => variants.push(i.value))
    const filteredProducts = products.map(i => i.changes.filter(j => variants.includes(j.variantID)))
    const changes = []
    filteredProducts.map(i => changes.push(i.at(0)))
    setSelectedVariants(changes)
  }, [selectedProduct, productsVariants])

  // this creates new state of product variants array when purchase option changes
  useEffect(() => {
    const productVariantsArray = []
    purchaseOption?.changes?.forEach(i => {
      const productVariant = {}
      productVariant.value = i?.variantID?.toString()
      productVariant.label = i.title
      productVariantsArray.push(productVariant)
    })
    if (productVariantsArray.length) productVariants.current = productVariantsArray
  }, [purchaseOption])

  const dataObject = JSON.parse(storage.initialData);
  // const purchaseOption = storage.initialData;
  const { offers } = dataObject;

  // let purchaseOption = offers[offerCount.current]
  // const purchaseOption = offers[0];
  // const purchaseOption = dataObject;

  // Define the changes that you want to make to the purchase, including the discount to the product.
  useEffect(() => {
    const newChangeArray = JSON.parse(JSON.stringify(purchaseOption.changes))
    // shopify's calculateChangeset won't work until you delete title from every single changes
    newChangeArray.forEach(i => delete i.title)
    // have to filter or shopify will return the sum of all product variants
    const filteredChangedArray = newChangeArray.filter(i => i.variantID === productVariant)
    setOriginalDiscount(filteredChangedArray[0]?.discount?.value)
    async function calculatePurchase() {
      setLoading(true)
      // Call Shopify to calculate the new price of the purchase, if the above changes are applied.
      const result = await calculateChangeset({
        // changes: purchaseOption.changes,
        changes: filteredChangedArray
      });

      setCalculatedPurchase(result.calculatedPurchase);
      setLoading(false);
    }

    calculatePurchase();
  }, [purchaseOption, productCount, productVariant]);

  // this reset product count and changes upon product change
  useEffect(() => {
    // will run first time when specific product changes
    // will not run when quantity or changes changes
    if (productID !== purchaseOption.id) {
      setProductID(purchaseOption.id)
      setProductVariant(purchaseOption.changes[0].variantID)
    }
    setProductCount(purchaseOption.changes[0].quantity)
  }, [purchaseOption])

  // useEffect(() => {
  //   if (purchaseOptionNumber <= JSON.parse(storage.initialData).offers.length - 1) {
  //     setPurchaseOption(JSON.parse(storage.initialData).offers[purchaseOptionNumber])
  //   }
  // }, [purchaseOptionNumber])

  async function acceptSelected() {
    const variants = []
    selectedVariants.map(i => variants.push(i?.variantID))
    // console.log(variants)
    // const newProducts = [...products]
    // newProducts.map(i => i.changes.map(j => delete i.title))
    // const product = newProducts.find(i => i.id === id)
    // const variantID = productsVariants.find(i => i.id === id)?.value

    setLoading(true);

    // Make a request to your app server to sign the changeset with your app's API secret key.
    const token = await fetch(`${APP_URL}/api/sign-changeset?shop-url=${shopURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: selectedVariants,
        token: inputData.token,
        'selected-product': true
        // 'product-count': productToBeShown === 1 ? productCount : product?.changes[0]?.quantity,
        // 'product-variant': productToBeShown === 1 ? productVariant : variantID
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));

    // // Make a request to Shopify servers to apply the changeset.
    const status = await applyChangeset(token);


    if (status?.status === 'processed') {
      if (pageNumber === 1) {
        // done()
        setPageNumber(2)
        setSelectedProduct([])
      }

      if (pageNumber === 2) {
        done()
        // setPageNumber(2)
        // setSelectedProduct([])
      }

      // const paidProducts = [...productsBought].concat(id)
      // setProductsBought(paidProducts)
    }

    // Redirect to the thank-you page.
    // done();
    // if (productToBeShown === 1) {
    //   if (offerCount.current <= (offers.length - 1) - 1) {
    //     offerCount.current += 1
    //     setPurchaseOption(offers[offerCount.current])
    //   } else done()
    // }

    // setLoading(false)
  }

  async function acceptOffer(id, offerNumber) {
    const newProducts = [...products]
    newProducts.map(i => i.changes.map(() => delete i.title))
    // const product = newProducts.find(i => i.id === id)
    // const variantID = productsVariants.find(i => i.id === id)?.value

    let filteredProducts
    if (typeof id === 'number') {
      filteredProducts = newProducts.find(i => i.id === id).changes.at(0)
    } else {
      filteredProducts = id
    }

    setLoading(true);

    // Make a request to your app server to sign the changeset with your app's API secret key.
    const token = await fetch(`${APP_URL}/api/sign-changeset?shop-url=${shopURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: productToBeShown === 1 ? id : typeof id === 'number' ? [filteredProducts.variantID] : filteredProducts,
        token: inputData.token,
        'offer-number': offerNumber
        // 'product-count': productToBeShown === 1 ? productCount : product?.changes[0]?.quantity,
        // 'product-variant': productToBeShown === 1 ? productVariant : variantID
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));

    // Make a request to Shopify servers to apply the changeset.
    const status = await applyChangeset(token);

    if (status?.status === 'processed') {
      const paidProducts = [...productsBought].concat(id)
      setProductsBought(paidProducts)
      setPurchaseCount(state => state + 1)

      if (JSON.parse(storage?.initialData)?.products?.template === 'list') {
        const products = JSON.parse(storage?.initialData)?.products?.offer?.page_1?.map(offer => {
          return offer?.data?.map(offerProduct => offerProduct)
        }).flat(Infinity)
        products.forEach(product => {
          if (product.changes.some(change => id.find(i => i.id === change.variantID))) {
            const tempMultipleBought = structuredClone(multipleBought)
            const tempObj = { id: product.id, status: true }
            tempMultipleBought.push(tempObj)
            setMultipleBought(tempMultipleBought)
          }
        })
      }

      if (productToBeShown === 1) {
        if (offerCount.current <= (offers.length - 1) - 1) {
          offerCount.current += 1
          setPurchaseOption(offers[offerCount.current])
        } else done()
      }
      // if (offerNumber === 0) {
      //   if (purchaseOptionNumber === JSON.parse(storage.initialData).offers.length - 1) {
      //     setPurchaseOption(JSON.parse(storage.initialData).offers[purchaseOptionNumber + 1])
      //     setPurchaseOptionNumber(JSON.parse(storage.initialData).offers.length - 1)
      //   } else {
      //     setPurchaseOption(JSON.parse(storage.initialData).offers[purchaseOptionNumber + 1])
      //     setPurchaseOptionNumber(state => state + 1)
      //   }
      // }
      if (offerNumber && pageNumber === 1) {
        setPageNumber(2)
      } else {
        if (offerNumber) done()
      }
    }

    // Redirect to the thank-you page.
    // done();

    setLoading(false)
  }

  async function acceptOfferAll() {
    setLoading(true)
    const newProducts = JSON.parse(JSON.stringify(products))
    const productIds = []
    newProducts.map(i => productIds.push(i.id))
    let variants = newProducts.map(i => {
      const filteredVariant = productsVariants.filter(j => i.id === j.id)[0].value
      return i.changes.filter(j => filteredVariant === j.variantID)
    })
    variants = variants.map(i => {
      if (i[0].title) {
        const newObj = JSON.parse(JSON.stringify(i[0]))
        delete newObj.title
        return newObj
      } else return i[0]
    })

    const token = await fetch(`${APP_URL}/api/sign-changeset?shop-url=${shopURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: variants,
        token: inputData.token,
        buyAll: true
        // 'product-count': productToBeShown === 1 ? productCount : product?.changes[0]?.quantity,
        // 'product-variant': productToBeShown === 1 ? productVariant : variantID
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));


    // Make a request to Shopify servers to apply the changeset.
    const status = await applyChangeset(token);

    if (status?.status === 'processed') {
      setLoading(false)
      done()
      //   const paidProducts = [...productsBought].concat(id)
      //   setProductsBought(paidProducts)
    }
  }

  async function acceptBundle() {
    setLoading(true)
    const token = await fetch(`${APP_URL}/api/sign-changeset?shop-url=${shopURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: bundleChanges,
        token: inputData.token,
        buyBundle: true
        // buyAll: true
        // 'product-count': productToBeShown === 1 ? productCount : product?.changes[0]?.quantity,
        // 'product-variant': productToBeShown === 1 ? productVariant : variantID
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));

    const status = await applyChangeset(token);

    if (status?.status === 'processed') {
      // setLoading(false)
      done()
    }
  }

  function declineOffer(id) {
    setLoading(true);
    // Redirect to the thank-you page
    // done();
    if (productToBeShown === 1) {
      if (offerCount.current <= (offers.length - 1) - 1) {
        offerCount.current += 1
        setPurchaseOption(offers[offerCount.current])
      } else done()
    } else {
      const newDeclinedProducts = JSON.parse(JSON.stringify(declinedProducts))
      newDeclinedProducts.push(id)
      setDeclinedProducts(newDeclinedProducts)
      setLoading(false)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (products && productsCount) {
      const newProducts = [...products]
      newProducts.map(i => {
        productsCount.map(j => {
          if (i.id === Number(Object.keys(j))) {
            i.changes.map(k => k.quantity = j[i.id])
          }
        })
      })
      setProducts(newProducts)
    }
  }, [productsCount])

  // const shipping = calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount;
  // const taxes = calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
  // const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
  // const discountedPrice = calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney.amount;
  // const originalPrice = calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

  if (JSON.parse(storage.initialData).products.template === 'single') {
    return (
      <SingleProduct
        purchaseOption={purchaseOption}
        originalDiscount={originalDiscount}
        productVariants={productVariants}
        productVariant={productVariant}
        setProductVariant={setProductVariant}
        productCount={productCount}
        setProductCount={setProductCount}
        setPurchaseOption={setPurchaseOption}
        currencyCode={currencyCode}
        calculatedPurchase={calculatedPurchase}
        loading={loading}
        acceptOffer={acceptOffer}
        declineOffer={declineOffer}
        setPurchaseOptionNumber={setPurchaseOptionNumber}
        offers={JSON.parse(storage.initialData).offers}
        purchaseOptionNumber={purchaseOptionNumber}
        storage={storage}
        done={done}
        productToBeShown={productToBeShown}
        offerCount={offerCount}
      />
    )
  } else if (JSON.parse(storage.initialData).products.template === 'list') {
    const products = JSON.parse(storage?.initialData)?.products?.offer?.page_1?.map(offer => {
      return offer?.data?.map(offerProduct => offerProduct)
    }).flat(Infinity)
    return <>
      <MultipleNotBundled
        products={products}
        productsBought={productsBought}
        productsVariants={productsVariants}
        declinedProducts={declinedProducts}
        currencyCode={currencyCode}
        setProductsVariants={setProductsVariants}
        productsCount={productsCount}
        acceptOffer={acceptOffer}
        declineOffer={declineOffer}
        formatCurrency={formatCurrency}
        acceptOfferAll={acceptOfferAll}
        changesForMultipleProducts={changesForMultipleProducts}
        calculatedPurchase={calculatedPurchase}
        productCount={productCount}
        loading={loading}
        setProductsCount={setProductsCount}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        acceptSelected={acceptSelected}
        totalPriceForMultipleProduct={totalPriceForMultipleProduct}
        offerNumber={1}
        done={done}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        multipleBought={multipleBought}
        setMultipleBought={setMultipleBought}
      />
      <BlockStack alignment="center">
        <Button
          subdued
          onPress={done}
        >
          <Text appearance="critical">I am not interested in buying</Text>
        </Button>
      </BlockStack>
    </>
  } else {
    // products for first page
    if (pageNumber === 1) {
      // first offer
      return (
        <>
          {
            firstPageFirstOffer && (
              firstPageFirstOffer.length === 1 ? <MultipleNotBundled
                products={firstPageFirstOffer}
                productsBought={productsBought}
                productsVariants={productsVariants}
                declinedProducts={declinedProducts}
                currencyCode={currencyCode}
                setProductsVariants={setProductsVariants}
                productsCount={productsCount}
                acceptOffer={acceptOffer}
                declineOffer={declineOffer}
                formatCurrency={formatCurrency}
                acceptOfferAll={acceptOfferAll}
                changesForMultipleProducts={changesForMultipleProducts}
                calculatedPurchase={calculatedPurchase}
                productCount={productCount}
                loading={loading}
                setProductsCount={setProductsCount}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                acceptSelected={acceptSelected}
                totalPriceForMultipleProduct={totalPriceForMultipleProduct}
                offerNumber={1}
                done={done}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
              />
                : firstPageFirstOffer.length >= 2 ? <BundleProducts
                  products={firstPageFirstOffer}
                  total={firstPageFirstChangeset?.totalOutstandingSet?.presentmentMoney?.amount}
                  tax={firstPageFirstChangeset?.addedTaxLines?.at(0)?.priceSet?.presentmentMoney?.amount}
                  price={firstPageFirstChangeset}
                  acceptOffer={acceptOffer}
                  loading={loading}
                  time={time}
                  off={JSON.parse(storage.initialData)?.products?.offer?.page_1[0]?.data[0]?.changes[0]?.discount?.title}
                  currencyCode={currencyCode}
                  done={done}
                  setPageNumber={setPageNumber}
                  pageNumber={pageNumber}
                  offerNumber={1}
                /> : null

            )}
          {

            firstPageSecondOffer && (
              firstPageSecondOffer.length === 1 ? <MultipleNotBundled
                products={firstPageSecondOffer}
                productsBought={productsBought}
                productsVariants={productsVariants}
                declinedProducts={declinedProducts}
                currencyCode={currencyCode}
                setProductsVariants={setProductsVariants}
                productsCount={productsCount}
                acceptOffer={acceptOffer}
                declineOffer={declineOffer}
                formatCurrency={formatCurrency}
                acceptOfferAll={acceptOfferAll}
                changesForMultipleProducts={changesForMultipleProducts}
                calculatedPurchase={calculatedPurchase}
                productCount={productCount}
                loading={loading}
                setProductsCount={setProductsCount}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                acceptSelected={acceptSelected}
                totalPriceForMultipleProduct={totalPriceForMultipleProduct}
                offerNumber={2}
                done={done}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
              />
                : firstPageSecondOffer.length >= 2 ? <BundleProducts
                  products={firstPageSecondOffer}
                  total={firstPageSecondChangeset?.totalOutstandingSet?.presentmentMoney?.amount}
                  tax={firstPageSecondChangeset?.addedTaxLines?.at(0)?.priceSet?.presentmentMoney?.amount}
                  price={firstPageSecondChangeset}
                  acceptOffer={acceptOffer}
                  loading={loading}
                  time={time}
                  off={JSON.parse(storage.initialData)?.products?.offer?.page_1[1]?.data[0]?.changes[0]?.discount?.title}
                  currencyCode={currencyCode}
                  done={done}
                  setPageNumber={setPageNumber}
                  pageNumber={pageNumber}
                  offerNumber={2}
                /> : null
            )}
        </>
      )

    }
    /* products for second page */
    else if (pageNumber === 2) {
      if (!secondPageFirstOffer && !secondPageSecondOffer) return done()
      // first offer
      // will show single product
      // console.log('secondPageFirstOffer', secondPageFirstOffer)
      // console.log('secondPageSecondOffer', secondPageSecondOffer)
      return (
        <>
          {
            secondPageFirstOffer && secondPageFirstOffer?.length === 1 ? <MultipleNotBundled
              products={secondPageFirstOffer}
              productsBought={productsBought}
              productsVariants={productsVariants}
              declinedProducts={declinedProducts}
              currencyCode={currencyCode}
              setProductsVariants={setProductsVariants}
              productsCount={productsCount}
              acceptOffer={acceptOffer}
              declineOffer={declineOffer}
              formatCurrency={formatCurrency}
              acceptOfferAll={acceptOfferAll}
              changesForMultipleProducts={changesForMultipleProducts}
              calculatedPurchase={calculatedPurchase}
              productCount={productCount}
              loading={loading}
              setProductsCount={setProductsCount}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              acceptSelected={acceptSelected}
              totalPriceForMultipleProduct={totalPriceForMultipleProduct}
              offerNumber={3}
              done={done}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
            />
              : secondPageFirstOffer?.length >= 2 ? <BundleProducts
                products={secondPageFirstOffer}
                total={secondPageFirstChangeset?.totalOutstandingSet?.presentmentMoney?.amount}
                tax={secondPageFirstChangeset?.addedTaxLines?.at(0)?.priceSet?.presentmentMoney?.amount}
                price={secondPageFirstChangeset}
                acceptOffer={acceptOffer}
                loading={loading}
                time={time}
                off={JSON.parse(storage.initialData)?.products?.offer?.page_2[0]?.data[0]?.changes[0]?.discount?.title}
                currencyCode={currencyCode}
                done={done}
                setPageNumber={setPageNumber}
                pageNumber={pageNumber}
                offerNumber={3}
              /> : null
          }
          {
            secondPageSecondOffer && (
              secondPageSecondOffer?.length === 1 ? <MultipleNotBundled
                products={secondPageSecondOffer}
                productsBought={productsBought}
                productsVariants={productsVariants}
                declinedProducts={declinedProducts}
                currencyCode={currencyCode}
                setProductsVariants={setProductsVariants}
                productsCount={productsCount}
                acceptOffer={acceptOffer}
                declineOffer={declineOffer}
                formatCurrency={formatCurrency}
                acceptOfferAll={acceptOfferAll}
                changesForMultipleProducts={changesForMultipleProducts}
                calculatedPurchase={calculatedPurchase}
                productCount={productCount}
                loading={loading}
                setProductsCount={setProductsCount}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                acceptSelected={acceptSelected}
                totalPriceForMultipleProduct={totalPriceForMultipleProduct}
                offerNumber={4}
                pageNumber={pageNumber}
                done={done}
                setPageNumber={setPageNumber}
              />
                : secondPageSecondOffer?.length >= 2 ? <BundleProducts
                  products={secondPageSecondOffer}
                  total={secondPageSecondChangeset?.totalOutstandingSet?.presentmentMoney?.amount}
                  tax={secondPageSecondChangeset?.addedTaxLines?.at(0)?.priceSet?.presentmentMoney?.amount}
                  price={secondPageSecondChangeset}
                  acceptOffer={acceptOffer}
                  loading={loading}
                  time={time}
                  off={JSON.parse(storage.initialData)?.products?.offer?.page_2[1]?.data[0]?.changes[0]?.discount?.title}
                  currencyCode={currencyCode}
                  done={done}
                  setPageNumber={setPageNumber}
                  pageNumber={pageNumber}
                  offerNumber={4}
                /> : null

            )}
        </>
      )
    }
  }

  // if (productToBeShown === 1) return (
  //   <SingleProduct
  //     purchaseOption={purchaseOption}
  //     originalDiscount={originalDiscount}
  //     productVariants={productVariants}
  //     productVariant={productVariant}
  //     setProductVariant={setProductVariant}
  //     productCount={productCount}
  //     setProductCount={setProductCount}
  //     setPurchaseOption={setPurchaseOption}
  //     currencyCode={currencyCode}
  //     calculatedPurchase={calculatedPurchase}
  //     loading={loading}
  //     acceptOffer={acceptOffer}
  //     declineOffer={declineOffer}
  //   />
  // )
  // else {
  //   if (!bundle) return (
  //     <MultipleNotBundled
  //       products={products}
  //       productsBought={productsBought}
  //       productsVariants={productsVariants}
  //       declinedProducts={declinedProducts}
  //       currencyCode={currencyCode}
  //       setProductsVariants={setProductsVariants}
  //       productsCount={productsCount}
  //       acceptOffer={acceptOffer}
  //       declineOffer={declineOffer}
  //       formatCurrency={formatCurrency}
  //       acceptOfferAll={acceptOfferAll}
  //       changesForMultipleProducts={changesForMultipleProducts}
  //       calculatedPurchase={calculatedPurchase}
  //       productCount={productCount}
  //       loading={loading}
  //       setProductsCount={setProductsCount}
  //       selectedProduct={selectedProduct}
  //       setSelectedProduct={setSelectedProduct}
  //       acceptSelected={acceptSelected}
  //       totalPriceForMultipleProduct={totalPriceForMultipleProduct}
  //     />
  //   )
  //   else {
  //     const shipping = bundleChangeset?.calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount

  //     return (
  //       <View>
  //         <CalloutBanner>
  //           <BlockStack>
  //             <Text emphasized size="medium">{`Summer sale offer (remaining ${timeLeft || '0:00'})`}</Text>
  //             <Text>{bundleOff}% off</Text>
  //           </BlockStack>
  //         </CalloutBanner>

  //         <Layout media={[
  //           { viewportSize: 'large', sizes: [0.33, 0.33, 0.33], maxInlineSize: 1200 }
  //         ]}>
  //           {
  //             bundleProducts.map((i, productI) => {
  //               // variable that hold information if user bought the product or not
  //               const paid = productsBought.indexOf(i.id) >= 0

  //               const variants = []
  //               i.changes.map(j => variants.push({ value: j.variantID, label: j.title }))
  //               const variant = [...productsVariants].find(j => j.id === i.id)?.value

  //               // variable that hold information if user delclined the product or not
  //               const declined = declinedProducts.indexOf(i.id) >= 0 ? true : false
  //               // productIndex.current += 1

  //               // splits description to two
  //               let productDescriptionFirstHalf = i.productDescription[0].split('.').slice(0, Math.round(i.productDescription[0].split('.').length / 2))
  //               let productDescriptionSecondHalf = i.productDescription[0].split('.').slice(Math.round(i.productDescription[0].split('.').length / 2))

  //               // removes empty elements
  //               productDescriptionFirstHalf = productDescriptionFirstHalf.filter(i => i !== '')
  //               productDescriptionSecondHalf = productDescriptionSecondHalf.filter(i => i !== '')

  //               // removes whitespace
  //               productDescriptionFirstHalf = productDescriptionFirstHalf.map(i => i = i.trim())
  //               productDescriptionSecondHalf = productDescriptionSecondHalf.map(i => i = i.trim())

  //               // joins array to an array
  //               productDescriptionFirstHalf = productDescriptionFirstHalf.join('. ')
  //               productDescriptionSecondHalf = productDescriptionSecondHalf.join('. ')

  //               // adds period at the end of the line
  //               productDescriptionFirstHalf = productDescriptionFirstHalf + '.'
  //               productDescriptionSecondHalf = productDescriptionSecondHalf + '.'

  //               const isDoubleDescription = i.productDescription[0].length > 450 ? true : false

  //               const imageAndDescriptionForDoubleDescription = [0.5, 0.5, 1]
  //               const imageAndDescriptionForSingleDescription = [1, 1]

  //               const productPrice = bundleChangeset?.calculatedPurchase?.updatedLineItems[productI]?.totalPriceSet?.presentmentMoney?.amount
  //               const offerPirce = bundleChangeset?.calculatedPurchase?.updatedLineItems[productI]?.priceSet?.presentmentMoney?.amount
  //               return (
  //                 <InlineStack key={i.id}>
  //                   <View blockPadding="extraLoose">
  //                     <Bookend>
  //                       <Layout media={[
  //                         { viewportSize: 'large', sizes: [1, 1, 1] }
  //                       ]}>
  //                         <View>
  //                           <TextContainer alignment="center">
  //                             <Text emphasized>{i.productTitle}</Text>
  //                           </TextContainer>
  //                         </View>

  //                         <View>
  //                           <Image source={i.productImageURL} />
  //                         </View>

  //                         <Layout sizes={[0.25, 0.05, 0.25]} maxInlineSize={500}>
  //                           <TextContainer alignment="center">
  //                             <Text emphasized role={'deletion'}>{formatCurrency(productPrice, currencyCode)}</Text>
  //                           </TextContainer>

  //                           <View></View>

  //                           <TextContainer alignment="center">
  //                             <Text emphasized appearance="critical">{formatCurrency(offerPirce, currencyCode)}</Text>
  //                           </TextContainer>
  //                         </Layout>
  //                       </Layout>
  //                     </Bookend>
  //                   </View>


  //                   {
  //                     productI !== (bundleProducts.length - 1) ?
  //                       <BlockStack alignment="center">
  //                         <Image source={`${APP_URL}/plus.png`} />
  //                       </BlockStack>
  //                       :
  //                       <BlockStack alignment="center">
  //                         <Image source={`${APP_URL}/transparent.png`} />
  //                       </BlockStack>

  //                   }
  //                 </InlineStack>
  //               )
  //             })
  //           }
  //         </Layout>

  //         <Layout media={[
  //           { viewportSize: 'large', sizes: [0.5, 0.05, 0.45, 1, 1], maxInlineSize: 1000 }
  //         ]}>
  //           <View blockPadding="extraLoose">
  //             <ProductDescription textLines={[bundleDescription]}></ProductDescription>
  //           </View>

  //           <View></View>

  //           {
  //             <View blockPadding="extraLoose">
  //               <BlockStack spacing="tight">
  //                 {/* <Separator /> */}
  //                 {
  //                   // bundleProducts.map((i, j) => {
  //                   // console.log(bundleChangeset?.calculatedPurchase?.updatedLineItems[j]?.totalPriceSet?.presentmentMoney?.amount)
  //                   <MoneyLine
  //                     label="Subtotal"
  //                     // amount={Number(bundleChangeset?.calculatedPurchase?.updatedLineItems[j]?.totalPriceSet?.presentmentMoney?.amount)}
  //                     amount={bundleDiscount}
  //                     loading={!calculatedPurchase}
  //                     currencyCode={currencyCode}
  //                   />
  //                   // })
  //                 }
  //                 <MoneyLine
  //                   label="Shipping"
  //                   amount={shipping}
  //                   loading={!calculatedPurchase}
  //                   currencyCode={currencyCode}
  //                 />
  //                 <MoneyLine
  //                   label="Taxes"
  //                   amount={bundleTax}
  //                   loading={!calculatedPurchase}
  //                   currencyCode={currencyCode}
  //                 />
  //                 <Separator />
  //                 <MoneySummary
  //                   label="Total"
  //                   amount={bundleTotal}
  //                   loading={!calculatedPurchase}
  //                   currencyCode={currencyCode}
  //                 />
  //               </BlockStack>

  //               <View blockPadding="loose">
  //                 <Bookend>
  //                   <Button loading={loading} onPress={acceptBundle} disabled={tempTimeLeft < 0}>Buy</Button>
  //                   <Button subdued loading={loading} onPress={done}>Decline</Button>
  //                 </Bookend>
  //               </View>
  //             </View>
  //           }

  //         </Layout>
  //       </View>
  //     )
  //   }
  // }
}


function SingleProduct({ calculatedPurchase, purchaseOption, currencyCode, loading, productVariant, productVariants, setProductVariant, productCount, setPurchaseOption, setProductCount, acceptOffer, declineOffer, originalDiscount, setPurchaseOptionNumber, purchaseOptionNumber, storage, done, productToBeShown, offerCount, offers }) {
  // Extract values from the calculated purchase.
  const shipping = calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount;
  const taxes = calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
  const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
  const discountedPrice = calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney.amount;
  const originalPrice = calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

  return (
    <BlockStack spacing="loose">
      <CalloutBanner>
        <BlockStack spacing="tight">
          <TextContainer>
            <Text size="medium" emphasized>
              It&#39;s not too late to add this to your order
            </Text>
          </TextContainer>
          <TextContainer>
            <Text size="medium">Add the {purchaseOption.productTitle} to your order and </Text>
            <Text size="medium" emphasized>
              {purchaseOption.changes[0].discount.title}
            </Text>
          </TextContainer>
        </BlockStack>
      </CalloutBanner>
      {/* <View blockPadding="loose">
        <TextContainer alignment="center" spacing="loose">
          <Text size="xlarge" emphasized={true}>It&#39;s not too late to get more! Grab another for {purchaseOption.changes[0].discount.title.toUpperCase()}</Text>
        </TextContainer>
      </View> */}
      <Layout
        media={[
          { viewportSize: 'small', sizes: [1, 0, 1], maxInlineSize: 0.9 },
          { viewportSize: 'medium', sizes: [532, 0, 1], maxInlineSize: 420 },
          { viewportSize: 'large', sizes: [560, 38, 340] },
        ]}
      >
        <Image description="product photo" source={purchaseOption.productImageURL || 'https://navidiumcheckout.com/cdn/product-not-found.png'} />
        <BlockStack />
        <BlockStack>
          <Heading>{purchaseOption.productTitle}</Heading>
          <PriceHeader
            discountedPrice={discountedPrice}
            originalPrice={originalPrice}
            loading={!calculatedPurchase}
            productCount={productCount}
            originalDiscount={originalDiscount}
            currencyCode={currencyCode}
          />
          <ProductDescription textLines={purchaseOption.productDescription} />
          <BlockStack spacing="tight">
            <Separator />
            <MoneyLine
              label="Subtotal"
              amount={discountedPrice}
              loading={!calculatedPurchase}
              currencyCode={currencyCode}
            />
            <MoneyLine
              label="Shipping"
              amount={shipping}
              loading={!calculatedPurchase}
              currencyCode={currencyCode}
            />
            <MoneyLine
              label="Taxes"
              amount={taxes}
              loading={!calculatedPurchase}
              currencyCode={currencyCode}
            />
            <Separator />
            <MoneySummary
              label="Total"
              amount={total}
              loading={!calculatedPurchase}
              currencyCode={currencyCode}
            />
          </BlockStack>

          {/* dropdown for product variants. only shows when there are variants available */}
          {
            productVariants.current && productVariants.current.length > 1 ? <Select
              label="Variant"
              value={productVariant}
              options={productVariants?.current}
              onChange={e => setProductVariant(Number(e))}
            /> : ''
          }

          {/* Quantity picker */}
          <Bookend alignment="trailing" trailing={true}>
            <TextBlock size="medium" emphasized>
              Quantity
            </TextBlock>
            <InlineStack alignment="trailing" spacing="xloose">
              <Button plain onPress={() => {
                if (productCount > 1) {
                  const newChange = [...purchaseOption.changes]
                  newChange.forEach(i => i.quantity = productCount - 1)
                  setProductCount(state => state - 1)
                  const newPurchaseOption = { ...purchaseOption, newChange }
                  setPurchaseOption(newPurchaseOption)
                }
              }}><Text size={"xlarge"}>−</Text></Button>
              {/* 
                <TextField type={"number"} label={"Quantity"} value={productCount} onInput={value => {
                  if (Number(value) < 1) {
                    const newChange = [...changes]
                    newChange.map(i => i.quantity = 1)
                    setProductCount(1)
                  } else {
                    const newChange = [...changes]
                    newChange.map(i => i.quantity = Number(value))
                    setProductCount(Number(value))
                  }
                }} />
                */}
              <Text>{productCount || 'Quantity'}</Text>
              <Button plain onPress={() => {
                const newChange = [...purchaseOption.changes]
                newChange.forEach(i => i.quantity = productCount + 1)
                setProductCount(state => state + 1)
                const newPurchaseOption = { ...purchaseOption, changes: newChange }
                setPurchaseOption(newPurchaseOption)
              }}><Text size={'xlarge'}>+</Text></Button>
            </InlineStack>
          </Bookend>

          {/* <Bookend>
            <Button loading={loading} onPress={() => {
              const newChange = [...changes]
              newChange.map(i => i.quantity = productCount + 1)
              setProductCount(state => state + 1)
            }}>Increase</Button>
            <Text>{productCount}</Text>
            <Button loading={loading} onPress={() => {
              if (productCount > 1) {
                const newChange = [...changes]
                newChange.map(i => i.quantity = productCount - 1)
                setProductCount(state => state - 1)
              }
            }}>Decrease</Button>
          </Bookend> */}
          <BlockStack>
            <Button onPress={() => {
              acceptOffer([{ id: productVariant || purchaseOption.changes.at(0).variantID, quantity: productCount }], 0)
              setPurchaseOptionNumber(state => state + 1)
            }} submit loading={loading}>
              Pay now · {formatCurrency(total, currencyCode)}
            </Button>
            <Button onPress={() => {
              if (productToBeShown === 1) {
                if (offerCount.current <= (offers.length - 1) - 1) {
                  offerCount.current += 1
                  setPurchaseOption(offers[offerCount.current])
                } else done()
              }
              // if (purchaseOptionNumber === JSON.parse(storage.initialData).offers.length - 1) {
              //   done()
              //   // setPurchaseOption(JSON.parse(storage.initialData).offers[purchaseOptionNumber + 1])
              //   // setPurchaseOptionNumber(JSON.parse(storage.initialData).offers.length - 1)
              // } else {
              //   setPurchaseOption(JSON.parse(storage.initialData).offers[purchaseOptionNumber + 1])
              // setPurchaseOptionNumber(state => state + 1)
              // }
            }} subdued loading={loading}>
              Decline this offer
            </Button>
          </BlockStack>
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}

function BundleProducts({ products, total, acceptOffer, loading, price, tax, time, off, currencyCode, done, pageNumber, setPageNumber, offerNumber }) {
  const minutes = Math.floor(time / 60)
  const seconds = (time % 60)
  const changes = []
  products.map(product => product.changes.map(change => changes.push(change)))
  // console.log(changes)
  // const test = calculateChangeset({})
  // console.log('products', products)
  // const shipping = bundleChangeset?.calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount
  const shipping = price?.calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount
  // console.log('shipping', shipping)
  const bundleOff = off
  const bundleDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sem fringilla ut morbi tincidunt augue interdum. Condimentum lacinia quis vel eros. Gravida dictum fusce ut placerat. Aliquet bibendum enim facilisis gravida neque convallis a.'
  const bundleDiscount = total - tax
  const bundleTax = tax
  const bundleTotal = total

  return (
    <View>
      <CalloutBanner>
        <BlockStack>
          <Text emphasized size="medium">{`Summer sale offer (remaining ${`${minutes}:${seconds.toString().length > 1 ? seconds : `0${seconds}`}` || '0:00'})`}</Text>
          <Text>{bundleOff}</Text>
        </BlockStack>
      </CalloutBanner>

      <Layout media={[
        { viewportSize: 'large', sizes: Array.from({ length: products.length }, i => 1 / products.length), maxInlineSize: 1200 }
      ]}>
        {
          products.map((i, productI) => {
            // const shipping = calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount;
            // const taxes = calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
            // const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
            // const discountedPrice = calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney.amount;
            // const originalPrice = calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

            const filteredPrice = price?.updatedLineItems?.filter(j => j.productId === i.id)?.at(0)
            // console.log(filteredPrice?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount)
            // const shipping = filteredPrice?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount;
            const productPrice = filteredPrice?.priceSet?.presentmentMoney?.amount
            const quantity = Number(filteredPrice?.quantity)
            const offerPrice = Number(filteredPrice?.totalPriceSet?.presentmentMoney?.amount / quantity).toFixed(2)
            // console.log(filteredPrice)
            // variable that hold information if user bought the product or not

            const variants = []
            i.changes.map(j => variants.push({ value: j.variantID, label: j.title }))
            // const variant = [...productsVariants].find(j => j.id === i.id)?.value

            // variable that hold information if user delclined the product or not
            // const declined = declinedProducts.indexOf(i.id) >= 0 ? true : false
            // productIndex.current += 1

            // const productPrice = bundleChangeset?.calculatedPurchase?.updatedLineItems[productI]?.totalPriceSet?.presentmentMoney?.amount
            // const offerPirce = bundleChangeset?.calculatedPurchase?.updatedLineItems[productI]?.priceSet?.presentmentMoney?.amount
            return (
              <InlineStack key={i.id}>
                <View blockPadding="extraLoose">
                  <Bookend>
                    <View>
                      <Layout media={[
                        { viewportSize: 'large', sizes: [1, 1, 1, 1] }
                      ]}>
                        <View>
                          <TextContainer alignment="center">
                            <Text emphasized>{i.productTitle}</Text>
                          </TextContainer>
                        </View>

                        <View>
                          <Image source={i.productImageURL || `https://navidiumcheckout.com/cdn/product-not-found.png`} />
                        </View>

                        <Layout sizes={[0.25, 0.05, 0.25]} maxInlineSize={500}>
                          <TextContainer alignment="center">
                            <Text emphasized role={'deletion'}>{formatCurrency(productPrice, currencyCode)}</Text>
                          </TextContainer>

                          <View></View>

                          <TextContainer alignment="center">
                            <Text emphasized appearance="critical">{formatCurrency(offerPrice, currencyCode)}</Text>
                          </TextContainer>
                        </Layout>


                        <Layout sizes={[0.25, 0.05, 0.25]} maxInlineSize={500}>
                          <View blockPadding="loose">
                            <Text>Quantity: {quantity || 0}</Text>
                          </View>
                        </Layout>
                      </Layout>
                    </View>
                  </Bookend>
                </View>

                {
                  productI !== (products.length - 1) ?
                    <BlockStack alignment="center">
                      <Image source={`${APP_URL}/plus.png`} />
                    </BlockStack>
                    :
                    <BlockStack alignment="center">
                      <Image source={`${APP_URL}/transparent.png`} />
                    </BlockStack>
                }
              </InlineStack>
            )
          })
        }
      </Layout>

      <Layout media={[
        { viewportSize: 'large', sizes: [0.5, 0.05, 0.45, 1, 1], maxInlineSize: 1000 }
      ]}>
        <View blockPadding="extraLoose">
          <ProductDescription textLines={[bundleDescription]}></ProductDescription>
        </View>

        <View></View>

        {
          <View blockPadding="extraLoose">
            <BlockStack spacing="tight">
              {/* <Separator /> */}
              {
                // bundleProducts.map((i, j) => {
                // console.log(bundleChangeset?.calculatedPurchase?.updatedLineItems[j]?.totalPriceSet?.presentmentMoney?.amount)
                <MoneyLine
                  label="Subtotal"
                  // amount={Number(bundleChangeset?.calculatedPurchase?.updatedLineItems[j]?.totalPriceSet?.presentmentMoney?.amount)}
                  amount={bundleDiscount}
                  // loading={!calculatedPurchase}
                  currencyCode={currencyCode}
                />
                // })
              }
              <MoneyLine
                label="Shipping"
                amount={shipping}
                // loading={!calculatedPurchase}
                currencyCode={currencyCode}
              />
              <MoneyLine
                label="Taxes"
                amount={bundleTax}
                // loading={!calculatedPurchase}
                currencyCode={currencyCode}
              />
              <Separator />
              <MoneySummary
                label="Total"
                amount={bundleTotal}
                // loading={!calculatedPurchase}
                currencyCode={currencyCode}
              />
            </BlockStack>

            <View blockPadding="loose">
              <Bookend>
                <Button loading={loading} onPress={() => {
                  const changes = []
                  JSON.parse(JSON.stringify(products)).forEach(j => j.changes.forEach(k => changes.push(k)))
                  const changesId = []
                  changes.forEach(j => changesId.push(j.variantID))
                  const variantIdWithQuantity = []
                  changes.forEach(change => {
                    const variantObj = {}
                    variantObj.id = change.variantID
                    variantObj.quantity = change.quantity
                    variantIdWithQuantity.push(variantObj)
                  })
                  // console.log(variantIdWithQuantity)
                  // console.log(changesId, changes)
                  acceptOffer(variantIdWithQuantity, offerNumber)
                }}>Buy</Button>
                <Button subdued loading={loading} onPress={() => {
                  pageNumber === 1 ? setPageNumber(2) : done()
                }}>Decline</Button>
              </Bookend>
            </View>
          </View>
        }

      </Layout>
    </View>
  )
}

function MultipleNotBundled({ products, productsBought, productsVariants, declinedProducts, currencyCode, setProductsVariants, productsCount, acceptOffer, declineOffer, formatCurrency, changesForMultipleProducts, acceptOfferAll, calculatedPurchase, loading, setProductsCount, productCount, selectedProduct, setSelectedProduct, acceptSelected, totalPriceForMultipleProduct, offerNumber, done, pageNumber, setPageNumber, multipleBought, setMultipleBought }) {
  return (
    <Layout media={[
      { viewportSize: "small", sizes: [1, 1, 1, 1], maxInlineSize: 400 },
      { viewportSize: "medium", sizes: Array.from({ length: products.length }, i => i = 1), maxInlineSize: 500 },
      { viewportSize: "large", sizes: Array.from({ length: products.length }, i => i = 1), maxInlineSize: 1000 }
    ]}>
      {
        products.map((i, productIndex) => {
          const productPrice = changesForMultipleProducts.find(j => i.id === j?.calculatedPurchase?.updatedLineItems[0]?.productId)
          const shipping = productPrice?.calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount
          const taxes = productPrice?.calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
          const total = productPrice?.calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
          const discountedPrice = productPrice?.calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney.amount;
          const originalPrice = productPrice?.calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

          // variable that hold information if user bought the product or not
          const paid = productsBought.indexOf(i.id) >= 0

          const variants = []
          i.changes.map(j => variants.push({ value: j.variantID, label: j.title || 'No title found' }))
          const variant = [...productsVariants].find(j => j.id === i.id)?.value
          const isBought = variants.some(variant => productsBought.some(boughtProduct => boughtProduct.id === variant.value))
          // if (isBought) {
          //   const tempBought = structuredClone(bought)
          //   tempBought.splice(productIndex, 1, true)
          //   setBought(tempBought)
          // }
          // if (isBought) {
          //   const tempBought = structuredClone(bought)
          //   const tempObj = { productId: i.id, status: false }
          //   const tempObjIndex = tempBought.findIndex(j => j.productId === i.id)
          //   tempBought.splice(tempObjIndex, 1, tempObj)
          //   setBought(tempBought)
          // }

          // variable that hold information if user delclined the product or not
          const declined = declinedProducts.indexOf(i.id) >= 0 ? true : false
          // productIndex.current += 1

          // splits description to two
          let productDescriptionFirstHalf = i.productDescription[0]?.split('.')?.slice(0, Math.round(i.productDescription[0]?.split('.')?.length / 2))
          let productDescriptionSecondHalf = i.productDescription[0]?.split('.')?.slice(Math.round(i.productDescription[0]?.split('.')?.length / 2))

          // removes empty elements
          productDescriptionFirstHalf = productDescriptionFirstHalf?.filter(i => i !== '')
          productDescriptionSecondHalf = productDescriptionSecondHalf?.filter(i => i !== '')

          // removes whitespace
          productDescriptionFirstHalf = productDescriptionFirstHalf?.map(i => i = i.trim())
          productDescriptionSecondHalf = productDescriptionSecondHalf?.map(i => i = i.trim())

          // joins array to an array
          productDescriptionFirstHalf = productDescriptionFirstHalf?.join('. ')
          productDescriptionSecondHalf = productDescriptionSecondHalf?.join('. ')

          // adds period at the end of the line
          productDescriptionFirstHalf = productDescriptionFirstHalf + '.'
          productDescriptionSecondHalf = productDescriptionSecondHalf + '.'

          const isDoubleDescription = i.productDescription[0]?.length > 450 ? true : false

          const imageAndDescriptionForDoubleDescription = [0.5, 0.5, 1]
          const imageAndDescriptionForSingleDescription = [1, 1]

          if (multipleBought?.find(obj => obj?.id === i?.id)?.status) return null
          else return (
            <Layout
              media={[
                { viewportSize: "large", sizes: [1] }
              ]}
              key={i.id}
            >
              {
                <View blockPadding="extraLoose">
                  {/* <Tiles maxPerLine={2}> */}
                  <Layout media={[
                    { viewportSize: 'large', sizes: [0.45, 0.05, 0.5] }
                  ]}>
                    {/* product image */}
                    <View>
                      <Layout
                        media={[
                          { viewportSize: 'large', sizes: isDoubleDescription ? imageAndDescriptionForDoubleDescription : imageAndDescriptionForSingleDescription },
                          // { viewportSize: 'large', sizes: [1, 1] },
                        ]}
                      >
                        <View>
                          {
                            isDoubleDescription ? <Image description="product photo" source={i.productImageURL} />
                              : <Image description="product photo" source={i.productImageURL} aspectRatio={2} fit="contain" />
                          }
                        </View>
                        {
                          isDoubleDescription ? <>
                            <ProductDescription textLines={[productDescriptionFirstHalf]} />
                            <ProductDescription textLines={[productDescriptionSecondHalf]} />
                          </> : <ProductDescription textLines={i.productDescription.at(0)?.length ? i.productDescription : ['No description found for this item.']} />
                        }
                      </Layout>
                    </View>

                    <View />

                    {/* product info */}
                    <View>
                      {/* product title */}
                      <Text emphasized size="xlarge">{i.productTitle}</Text>

                      {/* prodcut description */}
                      {/* <ProductDescription textLines={purchaseOption.productDescription} /> */}

                      {/* product price */}
                      <PriceHeaderForMultiple
                        discountedPrice={discountedPrice}
                        originalPrice={originalPrice}
                        loading={!calculatedPurchase}
                        productCount={productCount}
                        originalDiscount={i.changes[0].discount.value}
                        currencyCode={currencyCode}
                      />

                      <View blockPadding="tight" />

                      {/* variant and quantity picker */}
                      <Bookend>
                        {/* dropdown for product variants. only shows when there are variants available */}
                        {
                          variants.length > 1 ? <View blockPadding="tight">
                            <Select
                              label="Variant"
                              value={variant}
                              options={variants}
                              onChange={e => {
                                const newProductsVariants = [...productsVariants]
                                const filteredNewProductsVariants = newProductsVariants.map(j => {
                                  if (j.id === i.id) {
                                    return { id: i.id, value: Number(e) }
                                  } else return j
                                })
                                setProductsVariants(filteredNewProductsVariants)
                              }}
                            />
                          </View> : ''
                        }

                        {/* Quantity picker */}
                        <View blockPadding="loose">
                          <Layout media={[
                            { viewportSize: 'large', sizes: variants.length > 1 ? [0.25, 0.75] : [1] }
                          ]}>
                            {
                              variants.length > 1 ?
                                <View></View> : ''
                            }
                            <Bookend alignment="trailing" trailing={true} spacing="xtight">
                              {/* just a text that renders 'Quantity' on the screen */}
                              <TextBlock size="medium" emphasized>
                                Quantity
                              </TextBlock>

                              {/* <Heading level={3}>Quantity</Heading> */}

                              {/* buttons */}
                              <InlineStack alignment="trailing" spacing="loose">
                                {/* quantity decreaser */}
                                <Button plain onPress={() => {
                                  if ((productsCount.find(j => j.hasOwnProperty(i.id))[i.id]) > 1) {
                                    const newProductsCount = [...productsCount].map(j => (j.hasOwnProperty(i.id)) ? { [i.id]: j[i.id] -= 1 } : j)
                                    setProductsCount(newProductsCount)
                                  }
                                }}>
                                  <Text size={"xlarge"}>−</Text>
                                </Button>

                                {/* shows quantity */}
                                <Text emphasized size="medium">{productsCount ? productsCount.find(j => j[i.id])[i.id] : ''}</Text>

                                {/* quantity increaser */}
                                <Button plain onPress={() => {
                                  if (productsCount) {
                                    const newProductsCount = [...productsCount].map(j => (j.hasOwnProperty(i.id)) ? { [i.id]: j[i.id] += 1 } : j)
                                    setProductsCount(newProductsCount)
                                  }
                                }}>
                                  <Text size={'xlarge'}>+</Text>
                                </Button>
                              </InlineStack>
                            </Bookend>
                          </Layout>
                        </View>
                        {/* quantity pickser stops here */}
                      </Bookend>

                      <BlockStack spacing="tight">
                        <Separator />
                        <MoneyLine
                          label="Subtotal"
                          amount={discountedPrice}
                          loading={!calculatedPurchase}
                          currencyCode={currencyCode}
                        />
                        <MoneyLine
                          label="Shipping"
                          amount={shipping}
                          loading={!calculatedPurchase}
                          currencyCode={currencyCode}
                        />
                        <MoneyLine
                          label="Taxes"
                          amount={taxes}
                          loading={!calculatedPurchase}
                          currencyCode={currencyCode}
                        />
                        <Separator />
                        <MoneySummary
                          label="Total"
                          amount={total}
                          loading={!calculatedPurchase}
                          currencyCode={currencyCode}
                        />
                      </BlockStack>

                      <View blockPadding="loose">
                        <BlockStack spacing="xtight">
                          <Button
                            onPress={() => {
                              // const newProducts = JSON.parse(JSON.stringify(products))
                              // filteredProducts = newProducts.filter(j => j.id === i.id).at(0)
                              // const newSelectedProduct = JSON.parse(JSON.stringify(selectedProduct))
                              // const existsProduct = newSelectedProduct.find(j => j === i.id)

                              // if (!existsProduct) {
                              //   newSelectedProduct.push(i.id)
                              //   setSelectedProduct(newSelectedProduct)
                              // }
                              // console.log(i.id)
                              const count = productsCount.find(product => product.hasOwnProperty(i.id))
                              const changes = []
                              JSON.parse(JSON.stringify(products)).forEach(j => j.changes.forEach(k => changes.push(k)))
                              const changesId = []
                              changes.forEach(j => changesId.push(j.variantID))
                              acceptOffer([{ id: productsVariants.find(j => j.id === i.id).value, quantity: count[i.id] }], offerNumber)
                            }}
                            submit
                            loading={loading}>
                            {`Buy this item · ${formatCurrency(total, currencyCode)}`}
                          </Button>

                          <Button
                            onPress={() => {
                              const tempMultipleBought = structuredClone(multipleBought)
                              const tempArr = tempMultipleBought.filter(el => el.status).map(el => el.id)
                              if (!(products.length - (tempArr.length + 1))) return done()
                              const tempObj = { id: i.id, status: true }
                              tempMultipleBought.push(tempObj)
                              setMultipleBought(tempMultipleBought)
                              // const newSelectedProduct = JSON.parse(JSON.stringify(selectedProduct))
                              // const filteredProducts = newSelectedProduct.filter(j => i.id !== j)
                              // setSelectedProduct(filteredProducts)
                              // pageNumber === 1 ? setPageNumber(2) : done()
                              // declineOffer(i.id)
                            }}
                            subdued
                            loading={loading}
                            disabled={paid || declined}
                          >
                            <Text appearance={declined || paid ? '' : 'critical'}>Decline</Text>
                          </Button>
                        </BlockStack>
                      </View>
                    </View>
                  </Layout>
                  {/* </Tiles> */}
                </View>
              }
            </Layout>
          )
        })
      }
      {/* <View>
        <Bookend>
          <Button onPress={acceptOfferAll} loading={loading}>Buy All</Button>
          <Button subdued loading={loading}>Decline All</Button>
        </Bookend>
      </View> */}
    </Layout >
  )
}

function PriceHeader({ discountedPrice, originalPrice, loading, productCount, originalDiscount, currencyCode }) {
  return (
    <TextContainer alignment="leading" spacing="loose">
      <Text role="deletion" size="large">
        {!loading && formatCurrency(originalPrice, currencyCode)}
        {/* {!loading && '$' + Number(formatCurrency(originalPrice * productCount).replace(/[^0-9.]/g, '')).toFixed(2)} */}
      </Text>

      <Text emphasized size="large" appearance="critical">
        {' '}
        {/* {!loading && formatCurrency(discountedPrice)} */}
        {!loading && formatCurrency(Number(Number(originalPrice) - Number(originalPrice) * (originalDiscount / 100)), currencyCode)}
      </Text>
      {" "}
      {
        !loading && <Text size="large" appearance="success">(Save {originalDiscount}%)</Text>
      }
    </TextContainer>
  );
}

function ProductDescription({ textLines }) {
  return (
    <BlockStack spacing="xtight">
      {textLines?.map((text, index) => (
        <TextBlock key={index} subdued>
          {text}
        </TextBlock>
      ))}
    </BlockStack>
  );
}

function MoneyLine({ label, amount, loading = false, currencyCode }) {
  return (
    <Tiles>
      <TextBlock size="small">{label}</TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="small">
          {loading ? '-' : formatCurrency(amount, currencyCode)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function MoneySummary({ label, amount, currencyCode }) {
  return (
    <Tiles>
      <TextBlock size="medium" emphasized>
        {label}
      </TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="medium">
          {formatCurrency(amount, currencyCode)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function formatCurrency(amount, currencyCode) {
  if (!amount || parseInt(amount, 10) === 0) {
    return 'Free';
  }

  return `${getSymbolFromCurrency(currencyCode) || currencyCode + ' '}${Number(amount).toFixed(2)}`;
}

function PriceHeaderForMultiple({ discountedPrice, originalPrice, loading, productCount, originalDiscount, currencyCode }) {
  return (
    <TextContainer alignment="leading" spacing="loose">
      <Text role="deletion" size="medium">
        {!loading && formatCurrency(originalPrice, currencyCode)}
        {/* {!loading && '$' + Number(formatCurrency(originalPrice * productCount).replace(/[^0-9.]/g, '')).toFixed(2)} */}
      </Text>
      <Text emphasized size="medium" appearance="critical">
        {' '}
        {/* {!loading && formatCurrency(discountedPrice)} */}
        {!loading && formatCurrency(Number(Number(originalPrice) - Number(originalPrice) * (originalDiscount / 100)), currencyCode)}
      </Text>
      {" "}
      {
        !loading && <Text size="medium" appearance="success">(Save {originalDiscount}%)</Text>
      }
    </TextContainer>
  );
}
