import { BlockLayout, InlineLayout, Text, View, Image, Button, useExtensionApi, TextBlock, useApplyCartLinesChange } from "@shopify/checkout-ui-extensions-react";
import { useEffect, useState } from "react";

export default function SingleProduct({ data }) {
  const { i18n } = useExtensionApi()
  const applyCartLineChange = useApplyCartLinesChange()
  const [product, setProduct] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tempProducts = []
    // data?.widgets?.at(0)?.selected_feeds.forEach(feed => JSON.parse(feed?.products)?.forEach(product => tempProducts.push(product)))
    data?.widgets?.at(0)?.selected_feeds?.forEach(feed => JSON.parse(feed?.products)?.forEach(product => {
      product?.node?.variants?.nodes?.at(0)?.inventoryQuantity > 0 && tempProducts.push(product)
    }))
    setProduct(tempProducts.at(Math.floor(Math.random() * tempProducts.length)))
  }, [data])

  if (!Object.keys(product).length) return <></>
  else return (
    <>
      <BlockLayout rows={['fill', 'auto', 'auto']} border='base' borderRadius='base' borderWidth='base' padding='base'>
        <InlineLayout blockAlignment='center' columns={['25%', '75%']}>
          <View>
            <Image border='base' borderWidth='base' borderRadius='base' aspectRatio={1.2} fit='contain' source={product?.node?.featuredImage?.url} />
          </View>
          <View padding='base'>
            <TextBlock>{product?.node?.title}</TextBlock>
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
                merchandiseId: product?.node?.variants?.nodes?.at(0)?.id
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
