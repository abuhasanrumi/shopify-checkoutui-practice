import { useEffect, useState } from 'react';
import { useCartLines, Text, InlineLayout, TextBlock, View, Image, Divider, Pressable, useTotalAmount, useApplyCartLinesChange } from '@shopify/checkout-ui-extensions-react';

export default function FreeGift({ data }) {
  const [selected, setSelected] = useState('')
  const totalAmount = useTotalAmount()
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()
  const [cartLineProducts, setCartLineProducts] = useState([])
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const widgetCustomization = JSON.parse(data?.widgets?.at(0)?.widget_customization)
  const limit = widgetCustomization?.freeGiftLimit
  const products = widgetCustomization?.freeGiftProducts

  useEffect(() => {
    const lineProducts = cartLines.map(line => line.merchandise.id)
    const disableArray = []
    setCartLineProducts(lineProducts)
    products?.forEach(product => lineProducts.includes(product?.node?.variants?.nodes?.at(0)?.id) && disableArray.push(true))
    if (disableArray.includes(true)) setDisabled(true)
  }, [cartLines])

  if (!products || !products.length) return <></>
  else return (
    <>
      <InlineLayout blockAlignment='center' spacing='base' columns={['fill', 'auto', 'fill']}>
        <Divider />
        <TextBlock inlineAlignment='center'>{widgetCustomization?.title?.freeGift || 'GET THIS AWESOME FREE GIFTS'}</TextBlock>
        <Divider />
      </InlineLayout>

      <View padding='extraTight' />
      {
        limit - totalAmount.amount >= 0 ?
          <TextBlock emphasis='bold' appearance='critical' inlineAlignment='center'>{`Add ${totalAmount.currencyCode} ${Number(limit - totalAmount.amount).toFixed(2)} more to get the reward`}</TextBlock>
          : null
      }
      {
        disabled ? <TextBlock appearance='critical' inlineAlignment='center'>You have already claimed your gift</TextBlock> : null
      }
      <View padding='extraTight' />

      {
        products?.length && products?.map(product => {
          return (
            <View key={product?.node?.id} border='base' borderWidth='base' padding='base'>
              <Pressable
                loading={loading}
                disabled={disabled || limit - totalAmount.amount >= 0 || selected}
                onPress={async () => {
                  try {
                    setLoading(true)
                    const response = await applyCartLinesChange({
                      type: 'addCartLine',
                      quantity: 1,
                      merchandiseId: product?.node?.variants?.nodes?.at(0)?.id,
                    })
                    if (response.type === 'success') setSelected(product?.node?.id)
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                <InlineLayout columns={['auto', 'auto', 'fill']} blockAlignment='center' spacing='base'>
                  <View maxBlockSize={18} maxInlineSize={18}>
                    <Image source={product?.node?.id === selected || cartLineProducts.includes(product?.node?.variants?.nodes?.at(0)?.id) ? 'data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAxNiAxNiIgaGVpZ2h0PSIxOHB4IgogIHdpZHRoPSIxOHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoCiAgICBkPSJNMTYgOEE4IDggMCAxIDEgMCA4YTggOCAwIDAgMSAxNiAwem0tMy45Ny0zLjAzYS43NS43NSAwIDAgMC0xLjA4LjAyMkw3LjQ3NyA5LjQxNyA1LjM4NCA3LjMyM2EuNzUuNzUgMCAwIDAtMS4wNiAxLjA2TDYuOTcgMTEuMDNhLjc1Ljc1IDAgMCAwIDEuMDc5LS4wMmwzLjk5Mi00Ljk5YS43NS43NSAwIDAgMC0uMDEtMS4wNXoiCiAgICBmaWxsPScjMzMzMzMzJz48L3BhdGg+Cjwvc3ZnPgo=' : 'data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAxNiAxNiIgaGVpZ2h0PSIxOHB4IgogIHdpZHRoPSIxOHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik04IDE1QTcgNyAwIDEgMSA4IDFhNyA3IDAgMCAxIDAgMTR6bTAgMUE4IDggMCAxIDAgOCAwYTggOCAwIDAgMCAwIDE2eiIgZmlsbD0nIzMzMzMzMyc+PC9wYXRoPgo8L3N2Zz4K'} />
                  </View>
                  <View maxBlockSize={64} maxInlineSize={64}>
                    <Image source={product?.node?.featuredImage?.url} />
                  </View>
                  <View>
                    <Text>{product?.node?.title}</Text>
                  </View>
                </InlineLayout>
              </Pressable>
            </View>
          )
        })
      }
    </>
  )
}
