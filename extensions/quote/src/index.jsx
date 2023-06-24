import React, { useEffect, useState } from 'react';
import { useExtensionApi, render, BlockStack, Heading, Button, Icon, Grid, InlineStack, Image, Text, TextBlock, SkeletonImage, SkeletonText, useCartLines, Spinner, BlockSpacer, Divider, Pressable, View, InlineLayout, BlockLayout, Checkbox } from '@shopify/checkout-ui-extensions-react';

// render('Checkout::Actions::RenderBefore', () => <App />);
// render('Checkout::CartLines::RenderAfter', () => <App />);
// render('Checkout::CartLineDetails::RenderAfter', () => <App />);
// render('Checkout::Contact::RenderAfter', () => <App />);
// render('Checkout::CustomerInformation::RenderAfter', () => <App />);
// render('Checkout::DeliveryAddress::RenderBefore', () => <App />);
// render('Checkout::Dynamic::Render', () => <App />);
// render('Checkout::Reductions::RenderBefore', () => <App />);
// render('Checkout::Reductions::RenderAfter', () => <App />);
// render('Checkout::ShippingMethods::RenderBefore', () => <App />);
// render('Checkout::ShippingMethods::RenderBefore', () => <App />);
// render('Checkout::ShippingMethods::RenderAfter', () => <App />);

function App() {
  const widgetNum = 3
  const widgetName = 'quote'
  const { shop, buyerIdentity, presentmentLines, storage, extensionPoint } = useExtensionApi();
  const lines = useCartLines()
  const [templateId, setTemplateId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const [display, setDisplay] = useState(false)
  const [point, setPoint] = useState()

  useEffect(() => {
    if (point === extensionPoint) setDisplay(true)
    else setDisplay(false)
  }, [point, extensionPoint])

  useEffect(() => {
    if (Object.keys(data).length) segmentCondition(setDisplay, data, { lines, presentmentLines })
  }, [lines, data, presentmentLines.current])

  const products = []
  lines.forEach(line => products.push(line.merchandise.product.id))

  useEffect(() => {
    storage.read(widgetName)
      .then(storageData => {
        if (storageData) {
          setData(storageData)
          setTemplateId(storageData?.widgets?.find(widget => widget?.template_id === widgetNum)?.template_id)
          setPoint(storageData?.widgets?.find(widget => widget?.template_id === widgetNum)?.location?.position)
          setLoading(false)
        } else {
          fetch(`https://fuktae-ip-115-127-46-145.tunnelmole.com/api/get/widgets?shop-url=${shop.myshopifyDomain}&user-email=${buyerIdentity?.email?.current}&products=${products}`)
            .then(res => res.json())
            .then(resData => {
              setData(resData)
              setTemplateId(resData?.widgets?.find(widget => widget?.template_id === widgetNum)?.template_id)
              setPoint(resData?.widgets?.find(widget => widget?.template_id === widgetNum)?.location?.position)
              storage.write(widgetName, resData)
            })
            .finally(() => setLoading(false))
        }
      })
  }, [])

  if (loading) {
    return <InlineStack inlineAlignment='center'>
      <Spinner />
    </InlineStack>
  } else {
    if (display) {
      if (templateId === 3) {
        return <Quote data={data} />
      } else {
        return <></>
      }
    }
    else {
      return <></>
    }
  }
}

function segmentCondition(setDisplay, data, { lines, presentmentLines }) {
  const condition = JSON.parse(data?.widgets?.at(0)?.selected_segments)
  const inExObj = {}
  let includedArray = []
  let excludedArray = []

  Object
    .keys(condition)
    .forEach(i => i === 'included' ? includedArray = (condition[i]) : excludedArray = (condition[i]))

  // Object.keys(condition).forEach(i => conditions.push(condition[i]))
  // const displayArray = Array.from({ length: conditions.length })
  // const displayArray = []
  function arrayForEach(i, index) {
    const segments = []
    Object.keys(JSON.parse(i.conditions)).forEach(j => segments.push(JSON.parse(i.conditions)[j]))
    const segmentsDisplay = []
    segments.forEach(j => {
      const display = []
      j.forEach((k, kIndex) => {
        switch (k.logic) {
          case 'product-title':
            const titles = []
            const titlesBool = []

            lines.forEach(title => titles.push(title.merchandise.title))

            const titleRegexp = new RegExp(k.price, 'gi')

            if (k.value === 'contains') {
              titles.forEach(title => !title.toLowerCase().match(titleRegexp) ? titlesBool.push(false) : titlesBool.push(true))
            }
            else if (k.value === 'does-not-contains') {
              titles.forEach(title => !title.toLowerCase().match(titleRegexp) ? titlesBool.push(true) : titlesBool.push(false))
            }

            titlesBool.includes(true) ? display.push(true) : display.push(false)
            break

          case 'product-vendor':
            if (k.value === 'contains') {
              const vendors = []
              lines.forEach(i => vendors.push(i.merchandise.product.vendor))
              const vendorRegexp = new RegExp(k.price, 'gi')
              vendors.forEach(i => !i.toLowerCase().match(vendorRegexp) ? display.push(false) : display.push(true))
            } else if (k.value === 'does-not-contains') {
              const vendors = []
              lines.forEach(i => vendors.push(i.merchandise.product.vendor))
              const vendorRegexp = new RegExp(k.price, 'gi')
              vendors.forEach(i => !i.toLowerCase().match(vendorRegexp) ? display.push(true) : display.push(false))
            }
            break

          case 'product-type':
            const types = []
            lines.forEach(i => types.push(i.merchandise.product.productType))
            const typeRegexp = new RegExp(k.price, 'gi')
            if (k.value === 'contains') {
              types.forEach(i => !i.toLowerCase().match(typeRegexp) ? display.push(false) : display.push(true))
            } else if (k.value === 'does-not-contains') {
              types.forEach(i => !i.toLowerCase().match(typeRegexp) ? display.push(true) : display.push(false))
            }
            break

          case 'product-specific-quantity':
            const specificQuantity = lines?.find(line => line?.merchandise?.title?.match(new RegExp(j[kIndex - 1]?.price, 'gi')))?.quantity

            if (k.value === 'is-less-than') {
              Number(k.price) > specificQuantity ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < specificQuantity ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === specificQuantity ? display.push(true) : display.push(false)
            }
            break

          case 'cart-subtotal':
            let subtotalQuantity = 0
            presentmentLines.current.forEach(presentmentLine => subtotalQuantity += presentmentLine.cost.totalAmount.amount)

            if (k.value === 'is-less-than') {
              Number(k.price) > subtotalQuantity ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < subtotalQuantity ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === subtotalQuantity ? display.push(true) : display.push(false)
            }
            break

          case 'cart-line-count':
            if (k.value === 'is-less-than') {
              Number(k.price) > lines.length ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < lines.length ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === lines.length ? display.push(true) : display.push(false)
            }
            break

          case 'cart-item-count':
            let itemCount = 0
            lines.forEach(line => itemCount += line.quantity)

            if (k.value === 'is-less-than') {
              Number(k.price) > itemCount ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < itemCount ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === itemCount ? display.push(true) : display.push(false)
            }
            break

          case 'product-price':
            const prices = []
            lines?.forEach(line => prices.push(line.cost.totalAmount.amount))

            const isTrue = []

            if (k.value === 'is-less-than') {
              prices.forEach(price => {
                if (Number(k.price) > price) isTrue.push(true)
                else isTrue.push(false)
              })
              // Number(k.price) > cost.totalAmount.current.amount ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              prices.forEach(price => {
                if (Number(k.price) < price) isTrue.push(true)
                else isTrue.push(false)
              })
              // Number(k.price) < cost.totalAmount.current.amount ? display.push(true) : display.push(false)
            } else {
              prices.forEach(price => {
                if (Number(k.price) === price) isTrue.push(true)
                else isTrue.push(false)
              })
              // Number(k.price) === cost.totalAmount.current.amount ? display.push(true) : display.push(false)
            }
            isTrue.includes(true) ? display.push(true) : display.push(false)
            break

          case 'customer-total-spent':
            const total = Number(data?.widgets?.[0]?.['amount-spent'])
            if (k.value === 'is-less-than') {
              Number(k.price) > total ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < total ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === total ? display.push(true) : display.push(false)
            }
            break

          case 'customer-orders-count':
            const totalOrders = Number(data?.widgets?.[0]?.['customer-orders'])
            if (k.value === 'is-less-than') {
              Number(k.price) > totalOrders ? display.push(true) : display.push(false)
            } else if (k.value === 'is-greater-than') {
              Number(k.price) < totalOrders ? display.push(true) : display.push(false)
            } else {
              Number(k.price) === totalOrders ? display.push(true) : display.push(false)
            }
            break

          case 'collection':
            const collections = JSON.parse(data?.widgets?.at(0)?.collections)

            if (k.value === 'contains') {
              const titleRegexp = new RegExp(k.price, 'gi')
              const collection = collections.find(collection => collection.title.match(titleRegexp))
              collection ? display.push(true) : display.push(false)
            } else {
              const titleRegexp = new RegExp(k.price, 'gi')
              const collection = collections.find(collection => collection.title.match(titleRegexp))
              collection ? display.push(false) : display.push(true)
            }
            break

          case 'product-handle':
            const handles = JSON.parse(data?.widgets?.at(0)?.handles)

            if (k.value === 'contains') {
              const titleRegexp = new RegExp(k.price, 'gi')
              const handle = handles.find(handle => handle.handle.match(titleRegexp))
              handle ? display.push(true) : display.push(false)
            } else {
              const titleRegexp = new RegExp(k.price, 'gi')
              const handle = handles.find(handle => handle.handle.match(titleRegexp))
              handle ? display.push(false) : display.push(true)
            }
            break

          case 'customer-tags':
            const tags = JSON.parse(data?.widgets?.at(0)?.['customer-tags'])

            if (k.value === 'contains') {
              const titleRegexp = new RegExp(k.price, 'gi')
              const tag = tags?.find(tag => tag.match(titleRegexp))
              tag ? display.push(true) : display.push(false)
            } else {
              const titleRegexp = new RegExp(k.price, 'gi')
              const tag = tags?.find(tag => tag.match(titleRegexp))
              tag ? display.push(false) : display.push(true)
            }
            break

          default:
            break
        }
      })
      display.includes(false) ?
        segmentsDisplay.push(false)
        : segmentsDisplay.push(true)
    });
    if (runningIncluded) {
      segmentsDisplay.includes(true) ?
        includedDisplay.push(true)
        : includedDisplay.push(false)
    } else {
      segmentsDisplay.includes(true) ?
        excludedDisplay.push(true)
        : excludedDisplay.push(false)
    }
    // display.includes(false) ?
    //   displayArray.splice(index, 1, false)
    //   :
    //   displayArray.splice(index, 1, true)
  }

  const includedDisplay = []
  const excludedDisplay = []

  let runningIncluded = true
  includedArray.forEach(arrayForEach)
  includedDisplay.includes(true) ? inExObj.include = true : inExObj.include = false

  runningIncluded = false
  excludedArray.forEach(arrayForEach)
  excludedDisplay.includes(true) ? inExObj.exclude = true : inExObj.exclude = false

  if (inExObj.exclude) {
    setDisplay(false)
  } else {
    if (inExObj.include) setDisplay(true)
    else setDisplay(false)
  }
  // inExObj.include === true && setDisplay(true)
  // displayArray.find(i => i === true) && setDisplay(true)
  // console.log(lines.current.at(0).merchandise.title)
}

function Quote() {
  return (
    <>
      <BlockStack border='base' borderRadius='base' borderWidth='base' padding='base'>
        <Text size='base'>I have enough money to last me the rest of my life, unless I buy something.</Text>
        <Text size='base' appearance='subdued'>― Buy now</Text>
        <Grid columns={['10%', 'fill', '30%']} spacing='base' blockAlignment='center'>
          <Image source='https://i.postimg.cc/8kxWSbsv/avatar.png' borderRadius='base' />
          <Text>Jane</Text>
          <InlineStack inlineAlignment='end'>
            {
              Array.from({ length: 2 }).map(() => {
                return (
                  <Image key={crypto.randomUUID()} source='https://i.postimg.cc/Kz8Rq875/quote.png' />
                )
              })
            }
          </InlineStack>
        </Grid>
      </BlockStack>
    </>
  )
}
