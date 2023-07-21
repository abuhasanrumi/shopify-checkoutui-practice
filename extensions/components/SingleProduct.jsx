import { BlockLayout, InlineLayout, Text, View, Image, Button, useExtensionApi, TextBlock, useApplyCartLinesChange } from "@shopify/checkout-ui-extensions-react";
import { useEffect, useState } from "react";

export default function SingleProduct({ data, includedTrue }) {
  const fixedTime = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.time
  const { i18n, extensionPoint } = useExtensionApi()
  const applyCartLineChange = useApplyCartLinesChange()
  const [product, setProduct] = useState({})
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(fixedTime)
  const includedTrueIds = []
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  useEffect(() => {
    const tempProducts = []
    // data?.widgets?.at(0)?.selected_feeds.forEach(feed => JSON.parse(feed?.products)?.forEach(product => tempProducts.push(product)))
    data?.widgets?.at(0)?.selected_feeds?.forEach(feed => JSON.parse(feed?.products)?.forEach(product => {
      product?.node?.variants?.nodes?.at(0)?.inventoryQuantity > 0 && tempProducts.push(product)
    }))
    setProduct(tempProducts.at(0) || {})
  }, [data])

  useEffect(() => {
    if (fixedTime) {
      const timer = setInterval(() => setTime(state => state - 1), 1000)
      const timerCleaner = setTimeout(() => clearInterval(timer), ((fixedTime + 2) * 1000))

      return () => {
        clearInterval(timer)
        clearTimeout(timerCleaner)
      }
    }
  }, [])

  if ((product && !(Object.keys(product).length)) || time <= 0) return <></>
  else return (
    <>
      <BlockLayout rows={['fill', 'auto', 'auto']} border='base' borderRadius='base' borderWidth='base' padding='base'>
        <InlineLayout blockAlignment='center' columns={['25%', '75%']}>
          <View>
            <Image border='base' borderWidth='base' borderRadius='base' aspectRatio={1.2} fit='contain' source={product?.node?.featuredImage?.url} />
          </View>
          <View padding='base'>
            <TextBlock>{product?.node?.title}</TextBlock>
            {
              product?.node?.variants?.nodes?.at(0)?.compareAtPrice ?
                <>
                  <Text appearance="subdued" size="small" accessibilityRole='deletion'>
                    {i18n.formatCurrency(product?.node?.variants?.nodes?.at(0)?.compareAtPrice)}
                  </Text>
                  <Text> </Text>
                </> : null
            }
            <Text appearance="subdued" size="small">{i18n.formatCurrency(product?.node?.variants?.nodes?.at(0)?.price)}</Text>
          </View>
        </InlineLayout>
        <View padding='extraTight'>
        </View>
        <Button
          loading={loading}
          onPress={async () => {
            try {
              setLoading(true)
              await applyCartLineChange({
                type: 'addCartLine',
                quantity: 1,
                merchandiseId: product?.node?.variants?.nodes?.at(0)?.id,
                attributes: [
                  { key: '__nvd-position', value: extensionPoint },
                  { key: '__nvd-location', value: 'Checkout Page' },
                  { key: '__nvd-feed-id', value: JSON.stringify([data?.widgets?.at(0)?.selected_feeds?.at(0)?.id]) },
                  { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
                  { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) }
                ]
              })
            } finally {
              setLoading(false)
            }
          }}
        >
          Add to cart
        </Button>
      </BlockLayout>
    </>
  )
}
