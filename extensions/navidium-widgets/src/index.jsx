import React, { useEffect, useRef, useState } from 'react';
import { useExtensionApi, render, BlockStack, Heading, Button, Icon, Grid, InlineStack, Image, Text, TextBlock, SkeletonImage, SkeletonText, useCartLines, Spinner, BlockSpacer, Divider, Pressable, View, InlineLayout, BlockLayout, Checkbox, useExtensionEditor, useSettings, useTarget, useBuyerJourneyIntercept, useBuyerJourney, useApplyAttributeChange, useEmail } from '@shopify/checkout-ui-extensions-react';
import { reviewAvatar, fullStarSVG, halfStarSVG, emptyStarSVG, avatar, quoteIcon } from './icons';

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

  useEffect(async () => {
    try {
      const res = await fetch(`https://api.nvdmini.com/api/upsell-checkout-configuration?shop-url=${shop.myshopifyDomain}&user-email=${buyerIdentity?.email?.current}&products=${products}&widget-position=${extensionPoint}`)
      const resData = await res.json()
      if (resData.status === 200) {
        const oldResData = structuredClone(resData)
        oldResData.widgets = [resData.widgets.find(widget => widget.active)]
        setData(oldResData)
        setTemplateId(oldResData?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.template_id)
      }
    } finally {
      setLoading(false)
    }
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
          <Text>{widgetData?.user?.name || 'Anonymous'}</Text>
          <InlineStack inlineAlignment='end'>
            <Image source={quoteIcon} />
          </InlineStack>
        </Grid>
      </BlockStack>
    </>
  )
}
