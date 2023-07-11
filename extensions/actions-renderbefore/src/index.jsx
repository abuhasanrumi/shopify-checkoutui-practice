import { useEffect, useRef, useState } from 'react';
import { useExtensionApi, render, InlineStack, useCartLines, Spinner, useEmail, usePhone } from '@shopify/checkout-ui-extensions-react';
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
      const fetchURL = `https://api.nvdmini.com/api/upsell-checkout-configuration
                          ?shop-url=${shop.myshopifyDomain}
                          &user-email=${buyerIdentity?.email?.current}
                          &products=${products}
                          &widget-position=${extensionPoint}
                          &user-phone=${phone}`
      const res = await fetch(fetchURL.replace(/\s/g, ''))
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
    } else if (display && templateId === 8) {
      return <ListProduct data={data} />
    } else if (display && templateId === 9) {
      return <SingleProduct data={data} />
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
