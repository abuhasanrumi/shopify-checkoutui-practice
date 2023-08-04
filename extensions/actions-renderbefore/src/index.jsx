import { useEffect, useRef, useState } from 'react';
import { useExtensionApi, render, InlineStack, useCartLines, Spinner, useEmail, usePhone, ChoiceList, BlockLayout, Text, Choice, InlineLayout, TextBlock, Select, InlineSpacer, View, useExtensionEditor } from '@shopify/checkout-ui-extensions-react';
import Carousel from '../../components/Carousel.jsx';
import SMS from '../../components/SMS.jsx';
import FAQ from '../../components/FAQ.jsx';
import Banner from '../../components/Banner.jsx';
import Quote from '../../components/Quote.jsx';
import Review from '../../components/Review.jsx';
import Payment from '../../components/Payment.jsx';
import segmentCondition from './utils/segmentCondition.js';
import ListProduct from '../../components/ListProduct.jsx';
import SingleProduct from '../../components/SingleProduct.jsx';
import Gift from '../../components/Gift.jsx';
import Coupon from '../../components/Coupon.jsx';
import BNPL from '../../components/BNPL.jsx';
import Timer from '../../components/Timer.jsx'
import BNPLPayment from '../../components/BNPLPayment.jsx'
import Features from '../../components/Features.jsx'
import FreeGift from '../../components/FreeGift.jsx'
import STS from '../../components/STS.jsx'

render('Checkout::Actions::RenderBefore', () => <App />);

function App() {
  const { shop, buyerIdentity, presentmentLines, extensionPoint, storage } = useExtensionApi();
  const email = useEmail()
  const phone = usePhone()
  const lines = useCartLines()
  const [templateId, setTemplateId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const [display, setDisplay] = useState(false)
  const includedTrue = useRef([])
  const extensionEditor = useExtensionEditor()

  useEffect(() => {
    if (extensionEditor?.type === 'checkout') return setDisplay(true)
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
      const fetchURL = `https://api.nvdmini.com/api/upsell-checkout-configuration
                          ?shop-url=${shop.myshopifyDomain}
                          &user-email=${buyerIdentity?.email?.current}
                          &products=${products}
                          &widget-position=${extensionPoint}
                          &user-phone=${phone}`
      const res = await fetch(fetchURL.replace(/\s/g, new String()))
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
      return <Carousel data={data} includedTrue={includedTrue} productOnScreen={3} />
    } else if (display && templateId === 2) {
      return <FAQ includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 3) {
      return <Quote includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 4) {
      return <SMS includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 5) {
      return <Payment includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 6) {
      return <Review includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 7) {
      return <Banner includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 8) {
      return <ListProduct includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 9) {
      return <SingleProduct includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 10) {
      return <Gift includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 11) {
      return <Coupon includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 12) {
      return <BNPL includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 13) {
      return <Features includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 14) {
      return <Timer includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 15) {
      return <FreeGift includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 16) {
      return <BNPLPayment includedTrue={includedTrue} data={data} />
    } else if (display && templateId === 17) {
      return <STS includedTrue={includedTrue} data={data} />
    } else {
      return <></>
    }
  }
}
