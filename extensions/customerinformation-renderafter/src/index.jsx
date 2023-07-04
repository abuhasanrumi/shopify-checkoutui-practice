import React, { useEffect, useRef, useState } from 'react';
import { useExtensionApi, render, BlockStack, Heading, Button, Icon, Grid, InlineStack, Image, Text, TextBlock, SkeletonImage, SkeletonText, useCartLines, Spinner, BlockSpacer, Divider, Pressable, View, InlineLayout, BlockLayout, Checkbox, useExtensionEditor, useSettings, useTarget, useBuyerJourneyIntercept, useBuyerJourney, useApplyAttributeChange, useEmail } from '@shopify/checkout-ui-extensions-react';

render('Checkout::CustomerInformation::RenderAfter', () => <App />);

const reviewAvatar = 'data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCA0NDggNTEyIiBoZWlnaHQ9IjQ1cHgiCiAgd2lkdGg9IjQ1cHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGgKICAgIGQ9Ik0yMjQgMjU2QTEyOCAxMjggMCAxIDAgMjI0IDBhMTI4IDEyOCAwIDEgMCAwIDI1NnptLTQ1LjcgNDhDNzkuOCAzMDQgMCAzODMuOCAwIDQ4Mi4zQzAgNDk4LjcgMTMuMyA1MTIgMjkuNyA1MTJINDE4LjNjMTYuNCAwIDI5LjctMTMuMyAyOS43LTI5LjdDNDQ4IDM4My44IDM2OC4yIDMwNCAyNjkuNyAzMDRIMTc4LjN6Ij48L3BhdGg+Cjwvc3ZnPgo='
const fullStarSVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI0ZFQjQ0OSIgY2xhc3M9ImJpIGJpLXN0YXItZmlsbCIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMy42MTIgMTUuNDQzYy0uMzg2LjE5OC0uODI0LS4xNDktLjc0Ni0uNTkybC44My00LjczTC4xNzMgNi43NjVjLS4zMjktLjMxNC0uMTU4LS44ODguMjgzLS45NWw0Ljg5OC0uNjk2TDcuNTM4Ljc5MmMuMTk3LS4zOS43My0uMzkuOTI3IDBsMi4xODQgNC4zMjcgNC44OTguNjk2Yy40NDEuMDYyLjYxMi42MzYuMjgyLjk1bC0zLjUyMiAzLjM1Ni44MyA0LjczYy4wNzguNDQzLS4zNi43OS0uNzQ2LjU5Mkw4IDEzLjE4N2wtNC4zODkgMi4yNTZ6Ii8+Cjwvc3ZnPgo='
const halfStarSVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI0ZFQjQ0OSIgY2xhc3M9ImJpIGJpLXN0YXItaGFsZiIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNNS4zNTQgNS4xMTkgNy41MzguNzkyQS41MTYuNTE2IDAgMCAxIDggLjVjLjE4MyAwIC4zNjYuMDk3LjQ2NS4yOTJsMi4xODQgNC4zMjcgNC44OTguNjk2QS41MzcuNTM3IDAgMCAxIDE2IDYuMzJhLjU0OC41NDggMCAwIDEtLjE3LjQ0NWwtMy41MjMgMy4zNTYuODMgNC43M2MuMDc4LjQ0My0uMzYuNzktLjc0Ni41OTJMOCAxMy4xODdsLTQuMzg5IDIuMjU2YS41Mi41MiAwIDAgMS0uMTQ2LjA1Yy0uMzQyLjA2LS42NjgtLjI1NC0uNi0uNjQybC44My00LjczTC4xNzMgNi43NjVhLjU1LjU1IDAgMCAxLS4xNzItLjQwMy41OC41OCAwIDAgMSAuMDg1LS4zMDIuNTEzLjUxMyAwIDAgMSAuMzctLjI0NWw0Ljg5OC0uNjk2ek04IDEyLjAyN2EuNS41IDAgMCAxIC4yMzIuMDU2bDMuNjg2IDEuODk0LS42OTQtMy45NTdhLjU2NS41NjUgMCAwIDEgLjE2Mi0uNTA1bDIuOTA3LTIuNzctNC4wNTItLjU3NmEuNTI1LjUyNSAwIDAgMS0uMzkzLS4yODhMOC4wMDEgMi4yMjMgOCAyLjIyNnY5Ljh6Ii8+Cjwvc3ZnPgo='
const emptyStarSVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI0ZFQjQ0OSIgY2xhc3M9ImJpIGJpLXN0YXIiIHZpZXdCb3g9IjAgMCAxNiAxNiI+CiAgPHBhdGggZD0iTTIuODY2IDE0Ljg1Yy0uMDc4LjQ0NC4zNi43OTEuNzQ2LjU5M2w0LjM5LTIuMjU2IDQuMzg5IDIuMjU2Yy4zODYuMTk4LjgyNC0uMTQ5Ljc0Ni0uNTkybC0uODMtNC43MyAzLjUyMi0zLjM1NmMuMzMtLjMxNC4xNi0uODg4LS4yODItLjk1bC00Ljg5OC0uNjk2TDguNDY1Ljc5MmEuNTEzLjUxMyAwIDAgMC0uOTI3IDBMNS4zNTQgNS4xMmwtNC44OTguNjk2Yy0uNDQxLjA2Mi0uNjEyLjYzNi0uMjgzLjk1bDMuNTIzIDMuMzU2LS44MyA0Ljczem00LjkwNS0yLjc2Ny0zLjY4NiAxLjg5NC42OTQtMy45NTdhLjU2NS41NjUgMCAwIDAtLjE2My0uNTA1TDEuNzEgNi43NDVsNC4wNTItLjU3NmEuNTI1LjUyNSAwIDAgMCAuMzkzLS4yODhMOCAyLjIyM2wxLjg0NyAzLjY1OGEuNTI1LjUyNSAwIDAgMCAuMzkzLjI4OGw0LjA1Mi41NzUtMi45MDYgMi43N2EuNTY1LjU2NSAwIDAgMC0uMTYzLjUwNmwuNjk0IDMuOTU3LTMuNjg2LTEuODk0YS41MDMuNTAzIDAgMCAwLS40NjEgMHoiLz4KPC9zdmc+Cg=='
const avatar = 'data:image/png;base64,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'

function App() {
  const { shop, buyerIdentity, presentmentLines, extensionPoint, storage } = useExtensionApi();
  const email = useEmail()
  const lines = useCartLines()
  const [templateId, setTemplateId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const [display, setDisplay] = useState(false)
  const includedTrue = useRef([])

  useEffect(() => {
    if (Object.keys(data).length) segmentCondition(setDisplay, data, { lines, presentmentLines, extensionPoint, includedTrue })
  }, [lines, data, presentmentLines.current, email])

  const products = []
  lines.forEach(line => products.push(line.merchandise.product.id))

  // useBuyerJourneyIntercept(({ canBlockProgress }) => {
  //   return canBlockProgress && blocked ? { behavior: 'block', reason: 'Extension loading', errors: [{ message: 'Please wait until application is loaded' }] }
  //     : { behavior: 'allow' }
  // })

  useEffect(() => {
    storage.read('storageData').then(storageData => {
      if (!storageData) {
        fetch(`https://api.nvdmini.com/api/upsell-checkout-configuration?shop-url=${shop.myshopifyDomain}&user-email=${buyerIdentity?.email?.current}&products=${products}&widget-position=${extensionPoint}`)
          .then(res => res.json())
          .then(resData => {
            if (resData.status === 200) {
              setData(resData)
              setTemplateId(resData?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.template_id)
              // storage.write('storageData', resData)
            }
          })
          .finally(() => setLoading(false))
      } else {
        setData(storageData)
        setTemplateId(storageData?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.template_id)
        setLoading(false)
      }
    })
  }, [])

  if (loading) {
    // return <></>
    return <InlineStack inlineAlignment='center'>
      <Spinner />
    </InlineStack>
  } else {
    if (display && templateId === 1) {
      return <Carousel data={data} includedTrue={includedTrue} />
    } else if (display && templateId === 2) {
      return <FAQ data={data} />
    } else if (display && templateId === 3) {
      return <Quote data={data} />
    } else if (display && templateId === 4) {
      return <SMS data={data} />
    } else if (display && templateId === 5) {
      return <Payment data={data} />
    } else if (display && templateId === 6) {
      return <Review data={data} />
    } else if (display && templateId === 7) {
      return <Banner data={data} />
    } else {
      return <></>
    }
  }

  // return (
  //   <Banner title="navidium-widgets">
  //     {translate('welcome', { extensionPoint })}
  //   </Banner>
  // );
}

function segmentCondition(setDisplay, data, { lines, presentmentLines, extensionPoint, includedTrue }) {
  // data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_segments && JSON.parse(data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_segments)?.included?.forEach(i => console.log(i.exit_if_matched))
  // do not proceed further if the widget is not active
  if (!(data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.active)) return setDisplay(false)
  // do not proceed further if the widget location is not checkout page
  if (!(data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.widget_location === 'Checkout Page')) return setDisplay(false)

  const condition = data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_segments
  if (!condition) return setDisplay(false)
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
    if (exitIfMatched) return
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
      if (segmentsDisplay.includes(true)) {
        includedDisplay.push(true)
        includedTrue.current.push({ id: i.id, position: extensionPoint })
      } else {
        includedDisplay.push(false)
      }
    } else {
      segmentsDisplay.includes(true) ?
        excludedDisplay.push(true)
        : excludedDisplay.push(false)
    }
    if (i.exit_if_matched && includedDisplay.includes(true)) exitIfMatched = true
    // display.includes(false) ?
    //   displayArray.splice(index, 1, false)
    //   :
    //   displayArray.splice(index, 1, true)
  }

  const includedDisplay = []
  const excludedDisplay = []

  let runningIncluded = true
  let exitIfMatched = false
  includedArray.forEach(arrayForEach)
  includedDisplay.includes(true) ? inExObj.include = true : inExObj.include = false

  runningIncluded = false
  exitIfMatched = false
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

function Carousel({ data, includedTrue }) {
  const includedTrueIds = []
  const { i18n, applyCartLinesChange, extensionPoint } = useExtensionApi()
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  const [products, setProducts] = useState(() => {
    const productsArray = []
    data?.widgets?.at(0).selected_feeds.forEach(i => JSON.parse(i.products)?.forEach(j => productsArray.push(j)))
    return productsArray
  })
  const [filteredProducts, setFilteredProducts] = useState(Array.from({ length: 3 }))
  const [skeleton, setSkeleton] = useState(true)
  const [next, setNext] = useState(0)
  const [loading, setLoading] = useState({})

  useEffect(() => {
    if (products.length) {
      const emptyArray = []
      const oldProducts = structuredClone(products)
      oldProducts.forEach((i, j) => {
        if (j >= next && emptyArray.length < 3) emptyArray.push(i)
      })
      setFilteredProducts(emptyArray)
    }
  }, [products, next])

  useEffect(() => {
    if (skeleton) {
      const timer = setTimeout(() => setSkeleton(false), 500)
      const clearTimer = setTimeout(() => clearTimeout(timer), 500)

      return () => clearTimeout(clearTimer)
    }
  }, [skeleton])

  const feeds = []
  data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_feeds?.forEach(feed => feeds.push(feed?.products))
  const feedsWithId = []
  data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_feeds?.forEach(feed => JSON.parse(feed?.products).forEach(product => feedsWithId.push({ variantId: product?.node?.variants?.nodes?.at(0)?.id, feedId: feed.id })))

  if (!feeds.length) return <></>
  else return (
    <>
      <BlockStack border='base' padding='base' borderRadius='base'>
        {/* heading and buttons */}
        {
          JSON.parse(data?.widgets?.at(0)?.widget_customization)?.scroll_button_visibility ||
            JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title_visibility ?
            <Grid columns={['fill', 'auto']}>
              {
                JSON.parse(data?.widgets.at(0)?.widget_customization)?.title_visibility ?
                  <Heading level={3}>{JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title?.carousel || 'You may also like'}</Heading>
                  : null
              }
              {
                JSON.parse(data?.widgets?.at(0)?.widget_customization)?.scroll_button_visibility ?
                  <InlineStack inlineAlignment='end'>
                    <Button
                      disabled={next === 0}
                      onPress={() => {
                        setSkeleton(true)
                        setNext(state => next === 0 ? state : state - 3)
                      }} kind='plain'><Icon source='chevronLeft' /></Button>
                    <Button
                      disabled={products.length - next <= 3}
                      onPress={() => {
                        setSkeleton(true)
                        setNext(state => products.length - next > 3 ? state + 3 : state + products.length - next)
                      }} kind='plain'><Icon source='chevronRight' /></Button>
                  </InlineStack>
                  : null
              }
            </Grid>
            : null
        }

        {/* products */}
        <Grid spacing='base' columns={['auto', 'auto', 'auto']}>
          {
            filteredProducts.map((product, _index) => {
              const ids = []
              feedsWithId.filter(feed => product?.node?.variants?.nodes?.at(0)?.id === feed.variantId)?.forEach(id => ids.push(id.feedId))
              return (
                <BlockStack key={product?.node?.id || Math.random()} border='base' padding='base' borderRadius='base' spacing='extraTight'>
                  {
                    skeleton || !product?.node?.featuredImage?.url ?
                      <SkeletonImage inlineSize={300} blockSize={100} />
                      :
                      <Image aspectRatio={1.5} fit='contain' borderRadius='base' source={product?.node?.featuredImage?.url} />
                  }
                  <TextBlock inlineAlignment='center'>
                    {
                      skeleton || !product?.node?.title ?
                        <SkeletonText />
                        :
                        <Text size='small'>{product?.node?.title}</Text>
                    }
                  </TextBlock>
                  <TextBlock inlineAlignment='center'>
                    {
                      skeleton || !product?.node?.variants?.nodes?.at(0)?.price ?
                        <SkeletonText />
                        :
                        <Text appearance='subdued' size='small'>{i18n.formatCurrency(product?.node?.variants?.nodes?.at(0)?.price)}</Text>
                    }
                  </TextBlock>
                  <InlineStack inlineAlignment='center'>
                    {
                      skeleton || !product?.node?.variants?.nodes?.at(0)?.price ?
                        <SkeletonText />
                        :
                        <Button
                          loading={loading[product?.node?.variants?.nodes?.at(0)?.id]}
                          onPress={() => {
                            const newLoading = JSON.parse(JSON.stringify(loading))
                            newLoading[product?.node?.variants?.nodes?.at(0)?.id] = true
                            setLoading(newLoading)
                            applyCartLinesChange({
                              type: 'addCartLine',
                              merchandiseId: product?.node?.variants?.nodes?.at(0)?.id,
                              quantity: 1,
                              attributes: [
                                { key: '__nvd-position', value: extensionPoint },
                                { key: '__nvd-location', value: 'Checkout Page' },
                                { key: '__nvd-feed-id', value: JSON.stringify(ids) },
                                { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
                                { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) }
                              ]
                            })
                              .finally(() => {
                                const newLoading = JSON.parse(JSON.stringify(loading))
                                newLoading[product?.node?.variants?.nodes?.at(0)?.id] = false
                                setLoading(newLoading)
                              })
                          }}
                        >{JSON.parse(data?.widgets?.at(0)?.widget_customization)?.cta || 'Add to cart'}</Button>
                    }
                  </InlineStack>
                </BlockStack>
              )
            })
          }
        </Grid>
      </BlockStack>
    </>
  )
}

function SMS({ data }) {
  const { extensionPoint } = useExtensionApi()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

  return (
    <BlockLayout border='base' padding='base' cornerRadius='base'>
      <Checkbox>
        Get SMS alerts about your orders
      </Checkbox>
      <Text appearance="subdued">{widgetData?.title?.sms || 'Stay up to date on your purchase with order confirmation and shipping confirmation messages.'}</Text>
    </BlockLayout>
  )
}

function Payment({ data }) {
  const { extensionPoint } = useExtensionApi()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

  let iconURLs = []
  try {
    iconURLs = JSON.parse(widgetData?.iconURLs)
  } catch { }

  return (
    <>
      <BlockLayout rows={['auto', 'fill']} border='base' borderWidth='base' borderRadius='base' padding='base' spacing='base'>
        {/* text */}
        <TextBlock inlineAlignment="center">{widgetData?.title?.payment || 'Guaranteed Safe & Secure Checkout'}</TextBlock>

        {/* image */}
        <InlineLayout inlineAlignment='center' spacing='base'>
          {
            iconURLs.map(icon => {
              return <Image key={icon} source={icon} />
            })
          }
          {/* <Image source='https://i.postimg.cc/FzdC262n/Group.png' /> */}
          {/* <Image source='https://i.postimg.cc/C1VjFQBQ/Frame.png' /> */}
          {/* <Image source='https://i.postimg.cc/Gtg8s7tr/Frame-1.png' /> */}
          {/* <Image source='https://i.postimg.cc/VNw65Qgn/Frame-2.png' /> */}
          {/* <Image source='https://i.postimg.cc/fRf3cRJB/Frame-3.png' /> */}
          {/* <Image source='https://i.postimg.cc/prKVPsjq/Frame-4.png' /> */}
          {/* <Image source='https://i.postimg.cc/L6R2zBLF/Frame-5.png' /> */}
          {/* <Image source='https://i.postimg.cc/MT8rhtWW/Frame-6.png' /> */}
          {/* <Image source='https://i.postimg.cc/FRyxtTQB/visa.png' /> */}
        </InlineLayout>
      </BlockLayout>
    </>
  )
}

function Banner({ data }) {
  const { extensionPoint } = useExtensionApi()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

  return (
    <View inlineAlignment='center'>
      <Image source={widgetData?.banner} />
    </View>
  )
}

function Review({ data }) {
  const { extensionPoint } = useExtensionApi()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)
  const rating = widgetData?.user?.ratings || 4.5
  const fullStar = Math.floor(rating)
  const halfStar = Math.ceil(rating - fullStar)
  const emptyStar = 5 - (fullStar + halfStar)

  return (
    <BlockStack border='base' borderRadius='base' borderWidth='base' padding='base'>
      <Heading level={3}>{widgetData?.title?.review}</Heading>
      <TextBlock>{widgetData?.user?.review}</TextBlock>
      <Grid columns={['10%', 'fill', '30%']} spacing='base' blockAlignment='center'>
        <Image
          source={widgetData?.user?.image || reviewAvatar}
          borderRadius='fullyRounded'
          aspectRatio={1}
          fit='cover'
        />
        <Text>{widgetData?.user?.name}</Text>
        <InlineStack inlineAlignment='end' spacing='extraTight'>
          {Array.from({ length: fullStar }).map(() => <Image key={crypto.randomUUID()} source={fullStarSVG} />)}
          {Array.from({ length: halfStar }).map(() => <Image key={crypto.randomUUID()} source={halfStarSVG} />)}
          {Array.from({ length: emptyStar }).map(() => <Image key={crypto.randomUUID()} source={emptyStarSVG} />)}
        </InlineStack>
      </Grid>
    </BlockStack>
  )
}

const faqIds = ['1d1c8a20-48b3-49fb-9914-7dd982eb33d9', 'abe8dd12-e108-4a5b-8407-ce412daeb551', '3e9bc4b4-9887-47ca-8cc3-88f24be64cd3', '3877a333-4bd3-4a6f-9e98-5cf931c4b983', 'b0606b96-2240-4a21-879c-156d74872e06']
function FAQ({ data }) {
  const { extensionPoint } = useExtensionApi()
  const [open, setOpen] = useState(Array.from({ length: 3 }, i => i = false))
  // const faqs = [
  //   { id: '1d1c8a20-48b3-49fb-9914-7dd982eb33d9', q: 'Where is my order?', a: 'Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.' },
  //   { id: 'abe8dd12-e108-4a5b-8407-ce412daeb551', q: 'What does Guide Shipping Protection cover?', a: 'Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.' },
  //   { id: '3e9bc4b4-9887-47ca-8cc3-88f24be64cd3', q: 'How much does Guide Shipping Protection cost?', a: 'Eu dolor ac sagittis interdum ut eleifend at sed. Tempor accumsan in elit, nibh ac mattis turpis odio. Libero egestas id nec magna ipsum morbi. Eu vel placerat ridiculus fermentum duis. Purus ipsum mus augue non nunc, libero feugiat. Pharetra volutpat nibh facilisi auctor aliquet mattis dictum ac congue.' }
  // ]
  const faqs = JSON.parse(data.widgets.find(widget => widget.widget_position === extensionPoint)?.widget_customization)?.faqs
  const faqTitle = JSON.parse(data.widgets.find(widget => widget.widget_position === extensionPoint)?.widget_customization)?.title

  return (
    <>
      <Heading level={2}>{faqTitle.faq || 'Frequently asked questions'}</Heading>
      <BlockSpacer />
      <Divider size="base" />
      <BlockSpacer />
      {
        faqs.map((faq, j) => {
          return <View key={faqIds[j]}>
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

function Quote({ data }) {
  const { extensionPoint } = useExtensionApi()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

  return (
    <>
      <BlockStack border='base' borderRadius='base' borderWidth='base' padding='base'>
        <Text size='base'>{widgetData?.title?.quote}</Text>
        <Text size='base' appearance='subdued'>― Buy now</Text>
        <Grid columns={['10%', 'fill', '30%']} spacing='base' blockAlignment='center'>
          <Image source={widgetData?.user?.image || avatar} borderRadius='base' />
          <Text>{widgetData?.user?.name}</Text>
          <InlineStack inlineAlignment='end'>
            <Image source='data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjQ1IiB3aWR0aD0iNjAiIGZpbGw9JyMxODc5QjknIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQ0OCA1MTIiPjwhLS0hIEZvbnQgQXdlc29tZSBQcm8gNi40LjAgYnkgQGZvbnRhd2Vzb21lIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20gTGljZW5zZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tL2xpY2Vuc2UgKENvbW1lcmNpYWwgTGljZW5zZSkgQ29weXJpZ2h0IDIwMjMgRm9udGljb25zLCBJbmMuIC0tPjxwYXRoIGQ9Ik00NDggMjk2YzAgNjYuMy01My43IDEyMC0xMjAgMTIwaC04Yy0xNy43IDAtMzItMTQuMy0zMi0zMnMxNC4zLTMyIDMyLTMyaDhjMzAuOSAwIDU2LTI1LjEgNTYtNTZ2LThIMzIwYy0zNS4zIDAtNjQtMjguNy02NC02NFYxNjBjMC0zNS4zIDI4LjctNjQgNjQtNjRoNjRjMzUuMyAwIDY0IDI4LjcgNjQgNjR2MzIgMzIgNzJ6bS0yNTYgMGMwIDY2LjMtNTMuNyAxMjAtMTIwIDEyMEg2NGMtMTcuNyAwLTMyLTE0LjMtMzItMzJzMTQuMy0zMiAzMi0zMmg4YzMwLjkgMCA1Ni0yNS4xIDU2LTU2di04SDY0Yy0zNS4zIDAtNjQtMjguNy02NC02NFYxNjBjMC0zNS4zIDI4LjctNjQgNjQtNjRoNjRjMzUuMyAwIDY0IDI4LjcgNjQgNjR2MzIgMzIgNzJ6Ii8+PC9zdmc+Cg==' />
            {/* { */}
            {/*   Array.from({ length: 2 }).map(() => { */}
            {/*     return ( */}
            {/*       <Image key={crypto.randomUUID()} source='https://i.postimg.cc/Kz8Rq875/quote.png' /> */}
            {/*     ) */}
            {/*   }) */}
            {/* } */}
          </InlineStack>
        </Grid>
      </BlockStack>
    </>
  )
}

