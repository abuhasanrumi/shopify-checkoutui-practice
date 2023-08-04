import { useExtensionApi, useCartLines, useApplyCartLinesChange, Image, TextBlock, InlineLayout, BlockLayout } from '@shopify/checkout-ui-extensions-react';
import { useEffect } from 'react';

export default function Payment({ data, includedTrue }) {
  const { extensionPoint } = useExtensionApi()
  const cartLines = useCartLines()
  // console.log(cartLines?.at(0)?.attributes)
  const applyCartLinesChange = useApplyCartLinesChange()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)
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
    widgetNames.push('Payment')
    if (tempAttributes.length) {
      tempAttributes = [
        ...Array.from(filteredAttributes),
        { key: `__nvd-widget-names`, value: JSON.stringify(Array.from(new Set(widgetNames))) }
      ]
    } else {
      const tempArr = [
        { key: '__nvd-position', value: extensionPoint },
        { key: '__nvd-location', value: 'Checkout Page' },
        { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
        { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) },
        { key: `__nvd-widget-names`, value: JSON.stringify(Array.from(new Set(widgetNames))) }
      ]
      tempArr.forEach(i => tempAttributes.push(i))
    }
    console.log(tempAttributes)
    await applyCartLinesChange({
      id: firstCartLineId,
      type: 'updateCartLine',
      attributes: tempAttributes
    })
  }, [])

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
        </InlineLayout>
      </BlockLayout>
    </>
  )
}
