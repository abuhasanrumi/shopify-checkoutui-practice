import { useExtensionApi, useStorage, useApplyAttributeChange, Text, BlockLayout, Checkbox, View } from '@shopify/checkout-ui-extensions-react';
import { useEffect, useState } from 'react';

export default function SMS({ data }) {
  const [checked, setChecked] = useState(false)
  const [changed, setChanged] = useState(false)
  const storage = useStorage()
  const { extensionPoint } = useExtensionApi()
  const applyAttributeChange = useApplyAttributeChange()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

  useEffect(async () => {
    if (!changed) return
    applyAttributeChange({ type: 'updateAttribute', key: 'order_info_sms', value: checked ? '1' : '0' })
    storage.write('checked', checked)
  }, [checked, changed])

  useEffect(async () => {
    const storeData = await storage.read('checked')
    setChecked(storeData)
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
