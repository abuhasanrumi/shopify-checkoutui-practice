import { useEffect, useState } from 'react';
import { InlineLayout, Icon, View, Text, Grid, Button, useApplyDiscountCodeChange, useExtensionApi, useCartLines, useApplyCartLinesChange } from '@shopify/checkout-ui-extensions-react'

export default function Coupon({ data, includedTrue }) {
  const { extensionPoint } = useExtensionApi()
  const cartLines = useCartLines()
  const applyCartLinesChange = useApplyCartLinesChange()
  const couponCode = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title?.coupon
  const [loading, setLoading] = useState(false)
  const applyDiscountCodeChange = useApplyDiscountCodeChange()
  const includedTrueIds = []
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  useEffect(async () => {
    const firstCartLineId = cartLines?.at(0)?.id
    let tempAttributes = structuredClone(cartLines?.at(0)?.attributes)
    let widgetNames = []
    try {
      widgetNames = JSON.parse(tempAttributes?.find(i => i.key === '__nvd-widget-names')?.value)
    } catch { }
    const filteredAttributes = tempAttributes.filter(i => i.key !== '__nvd-widget-names')
    widgetNames.push('Coupon')
    if (tempAttributes.length) {
      tempAttributes = [
        ...Array.from(filteredAttributes),
        { key: '__nvd-widget-names', value: JSON.stringify(Array.from(new Set(widgetNames))) }
      ]
    } else {
      const tempArr = [
        { key: '__nvd-position', value: extensionPoint },
        { key: '__nvd-location', value: 'Checkout Page' },
        { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
        { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) },
        { key: '__nvd-widget-names', value: JSON.stringify(Array.from(new Set(widgetNames))) }
      ]
      tempArr.forEach(i => tempAttributes.push(i))
    }
    await applyCartLinesChange({
      id: firstCartLineId,
      type: 'updateCartLine',
      attributes: tempAttributes
    })
  }, [])

  if (!couponCode) return <></>
  else return (
    <InlineLayout border='base' borderWidth='base' borderRadius='base' padding='base'>
      <View>
        <Grid columns={['auto', 'fill', 'fill']} spacing='base' blockAlignment='center'>
          <Icon size='large' appearance='subdued' source='discount' />
          <Text emphasis='bold' appearance='subdued'>{couponCode}</Text>
          <View inlineAlignment='end'>
            <Button
              loading={loading}
              onPress={() => {
                setLoading(true)
                applyDiscountCodeChange({ type: 'addDiscountCode', code: couponCode })
                  .finally(() => setLoading(false))
              }}
            >
              Apply
            </Button>
          </View>
        </Grid>
      </View>
    </InlineLayout>
  )
}
