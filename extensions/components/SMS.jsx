import { useExtensionApi, useCartLines, useApplyCartLinesChange, useStorage, useApplyAttributeChange, Text, BlockLayout, Checkbox, View } from '@shopify/checkout-ui-extensions-react';
import { useEffect, useState } from 'react';

export default function SMS({ data, includedTrue }) {
  const [checked, setChecked] = useState(false)
  const [changed, setChanged] = useState(false)
  const storage = useStorage()
  const { extensionPoint } = useExtensionApi()
  const cartLines = useCartLines()
  const applyCartLinesChange = useApplyCartLinesChange()
  const applyAttributeChange = useApplyAttributeChange()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)
  const includedTrueIds = []
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  useEffect(async () => {
    if (!changed) return
    applyAttributeChange({ type: 'updateAttribute', key: 'order_info_sms', value: checked ? '1' : '0' })
    storage.write('checked', checked)
  }, [checked, changed])

  useEffect(async () => {
    const storeData = await storage.read('checked')
    setChecked(storeData)
  }, [])

  useEffect(async () => {
    if (changed) {
      storage.write('checked', checked)
    }
    const firstCartLineId = cartLines?.at(0)?.id
    let tempAttributes = structuredClone(cartLines?.at(0)?.attributes)
    let widgetNames = []
    try {
      widgetNames = JSON.parse(tempAttributes?.find(i => i.key === '__nvd-widget-names')?.value)
    } catch { }
    const filteredAttributes = tempAttributes.filter(i => i.key !== '__nvd-widget-names')
    widgetNames.push('SMS')
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
    console.log(tempAttributes, 'sms')
    await applyCartLinesChange({
      id: firstCartLineId,
      type: 'updateCartLine',
      attributes: tempAttributes
    })
  }, [])

  return (
    <BlockLayout border='base' padding='base' cornerRadius='base'>
      <View>
        <Checkbox
          checked={checked}
          onChange={e => {
            setChecked(e)
            setChanged(true)
          }}
        >
          Get SMS alerts about your orders
        </Checkbox>
        <View padding='extraTight' />
        <Text appearance="subdued">{widgetData?.title?.sms || 'Stay up to date on your purchase with order confirmation and shipping confirmation messages.'}</Text>
      </View>
    </BlockLayout>
  )
}
