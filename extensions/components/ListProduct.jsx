import { BlockLayout, Heading, Grid, Text, Image, View, Button, TextBlock, useExtensionApi, ScrollView, useApplyCartLinesChange } from "@shopify/checkout-ui-extensions-react";
import { useEffect, useState } from "react";

export default function ListProduct({ data }) {
  const fixedTime = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.time
  const { i18n } = useExtensionApi()
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

  if (time <= 0) return <></>
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
              products.map(product => {
                return (
                  <Grid border='base' borderWidth='base' borderRadius='base' key={product?.node?.id + 'NavidiumListProduct'} blockAlignment='center' columns={['30%', 'fill', '30%']}>
                    <View padding='base'>
                      <Image aspectRatio={1.5} fit='contain' source={product?.node?.featuredImage?.url} />
                    </View>
                    <View>
                      <TextBlock size="small">{product?.node?.title}</TextBlock>
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
                            applyCartLineChange({
                              type: 'addCartLine',
                              quantity: 1,
                              merchandiseId: product?.node?.variants?.nodes?.at(0)?.id
                            })
                          } finally {
                            oldLoading[product?.node?.variants?.nodes?.at(0)?.id] = false
                            setLoading(oldLoading)
                          }
                        }}
                      >Add to cart</Button>
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
