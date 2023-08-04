import { BlockLayout, Heading, Grid, Text, Image, View, Button, TextBlock, useExtensionApi, ScrollView, useApplyCartLinesChange } from "@shopify/checkout-ui-extensions-react";
import { useEffect, useState } from "react";

export default function ListProduct({ data, includedTrue }) {
  const cta = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.listCta
  const fixedTime = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.time
  const { i18n, extensionPoint } = useExtensionApi()
  const applyCartLineChange = useApplyCartLinesChange()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState({})
  const [time, setTime] = useState(fixedTime)

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

  useEffect(() => {
    const tempProducts = []
    data?.widgets?.at(0)?.selected_feeds.forEach(feed => JSON.parse(feed?.products)?.forEach(i => tempProducts.push(i)))

    const tempLoading = {}
    tempProducts.forEach(product => ({ [product?.node?.variants?.nodes?.at(0)?.id]: false }))

    setProducts(tempProducts)
    setLoading(tempLoading)
  }, [data])

  const feeds = []
  data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_feeds?.forEach(feed => feeds.push(feed?.products))
  const feedsWithId = []
  data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_feeds?.forEach(feed => JSON.parse(feed?.products).forEach(product => feedsWithId.push({ variantId: product?.node?.variants?.nodes?.at(0)?.id, feedId: feed.id })))
  const includedTrueIds = []
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  if (time <= 0 || !products.length) return <></>
  else return (
    <ScrollView hint={{ type: 'pill', content: 'Scroll to view' }} maxBlockSize={500}>
      <BlockLayout>
        <View>
          <View padding='base'>
            <Heading inlineAlignment="center" level={3}>
              {JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title?.list || 'COMPLETE YOUR SET'}
            </Heading>
          </View>
          <Grid spacing='base'>
            {
              products.map((product, index) => {
                const ids = []
                feedsWithId.filter(feed => product?.node?.variants?.nodes?.at(0)?.id === feed.variantId)?.forEach(id => ids.push(id.feedId))

                return (
                  <Grid border='base' borderWidth='base' borderRadius='base' key={product?.node?.id + 'NavidiumListProduct' + index} blockAlignment='center' columns={['30%', 'fill', '30%']}>
                    <View padding='base'>
                      <Image aspectRatio={1.5} fit='contain' source={product?.node?.featuredImage?.url} />
                    </View>
                    <View>
                      <TextBlock size="small">{product?.node?.title}</TextBlock>
                      {
                        product?.node?.variants?.nodes?.at(0)?.compareAtPrice ?
                          <>
                            <Text appearance="subdued" size="small" accessibilityRole='deletion'>{i18n.formatCurrency(product?.node?.variants?.nodes?.at(0)?.compareAtPrice)}</Text>
                            <Text> </Text>
                          </>
                          : null
                      }
                      <Text appearance="subdued" size="small">{i18n.formatCurrency(product?.node?.variants?.nodes?.at(0)?.price)}</Text>
                    </View>
                    <View inlineAlignment='center'>
                      <Button
                        loading={loading[product?.node?.variants?.nodes?.at(0)?.id]}
                        onPress={async () => {
                          const oldLoading = structuredClone(loading)
                          oldLoading[product?.node?.variants?.nodes?.at(0)?.id] = true
                          setLoading(oldLoading)

                          try {
                            await applyCartLineChange({
                              type: 'addCartLine',
                              quantity: 1,
                              merchandiseId: product?.node?.variants?.nodes?.at(0)?.id,
                              attributes: [
                                { key: '__nvd-position', value: extensionPoint },
                                { key: '__nvd-location', value: 'Checkout Page' },
                                { key: '__nvd-feed-id', value: JSON.stringify(ids) },
                                { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
                                { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) }
                              ]
                            })
                          } finally {
                            oldLoading[product?.node?.variants?.nodes?.at(0)?.id] = false
                            setLoading(oldLoading)
                            const oldProducts = structuredClone(products)
                            setProducts(oldProducts.filter(arrayProduct => arrayProduct?.node?.id !== product?.node?.id))
                          }
                        }}
                      >
                        {cta || 'Add to cart'}
                      </Button>
                    </View>
                  </Grid>
                )
              })
            }
          </Grid>
        </View>
      </BlockLayout>
    </ScrollView>
  )
}
