import React, { useEffect, useState } from 'react';
import { useExtensionApi, render, BlockStack, Heading, Button, Icon, Grid, InlineStack, Image, Text, TextBlock, SkeletonImage, SkeletonText, useCartLines, Spinner, BlockSpacer, Divider, Pressable, View, InlineLayout, BlockLayout, Checkbox, useExtensionData } from '@shopify/checkout-ui-extensions-react';

// fetch(`https://fuktae-ip-115-127-46-145.tunnelmole.com/api/get/widgets?shop-url=${useExtensionApi().shop.myshopifyDomain}`)
//   .then(res => res.json())
//   .then(data => console.log(data))

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
  const widgetNum = 2
  const widgetName = 'faq'
  const { shop, buyerIdentity, presentmentLines, storage, extensionPoint } = useExtensionApi();
  const test = useExtensionData()
  const lines = useCartLines()
  const [templateId, setTemplateId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const [display, setDisplay] = useState(false)
  const [point, setPoint] = useState()

  useEffect(() => {
    console.log('faq', point, extensionPoint)
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
    if (display && templateId === 2) {
      return <FAQ data={data} />
    } else {
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
            const specificQuantity = lines.find(line => line?.merchandise?.title?.match(new RegExp(j[kIndex - 1]?.price, 'gi')))?.quantity

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

function FAQ() {
  const [open, setOpen] = useState(Array.from({ length: 3 }, i => i = false))
  const faqs = [
    { id: '1d1c8a20-48b3-49fb-9914-7dd982eb33d9', q: 'Where is my order?', a: 'Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.' },
    { id: 'abe8dd12-e108-4a5b-8407-ce412daeb551', q: 'What does Guide Shipping Protection cover?', a: 'Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.' },
    { id: '3e9bc4b4-9887-47ca-8cc3-88f24be64cd3', q: 'How much does Guide Shipping Protection cost?', a: 'Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.' }
  ]

  return (
    <>
      <Heading level={2}>Frequently asked questions</Heading>
      <BlockSpacer />
      <Divider size="base" />
      <BlockSpacer />
      {
        faqs.map((faq, j) => {
          return <View key={faq.id}>
            <Grid
              columns={['fill', 'auto']}
              spacing="none"
            >
              <Pressable onPress={() => {
                const oldState = JSON.parse(JSON.stringify(open))
                oldState.splice(j, 1, !oldState[j])
                setOpen(oldState)
              }}>
                <TextBlock emphasis="bold">{faq.q}</TextBlock>
              </Pressable>
              <Pressable onPress={() => {
                const oldState = JSON.parse(JSON.stringify(open))
                oldState.splice(j, 1, !oldState[j])
                setOpen(oldState)
              }}>
                <Icon source={open[j] ? 'close' : 'plus'} />
              </Pressable>
            </Grid>
            <BlockSpacer />
            {
              open[j] &&
              <>
                <TextBlock>{faq.a}</TextBlock>
                <BlockSpacer />
              </>
            }
            <Divider size="base" />
            <BlockSpacer />
          </View>
        })
      }
    </>
  )
}
