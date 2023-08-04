import { Checkbox, Grid, TextField, View, Text, useApplyNoteChange, useStorage } from "@shopify/checkout-ui-extensions-react";
import { useEffect, useState } from "react";

export default function Gift() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const applyNoteChange = useApplyNoteChange()
  const storage = useStorage()

  useEffect(async () => {
    const res = await storage.read('message')
    setIsOpen(res ? true : false)
    setMessage(res)
  }, [])

  return (
    <>
      <Grid padding='base' border='base' borderRadius='base' borderWidth='base'>
        <View>
          <Checkbox
            checked={isOpen}
            onChange={e => setIsOpen(e)}
          >
            This is a gift
          </Checkbox>
          {
            isOpen && <>
              <View padding='tight'>
              </View>
              <TextField
                onChange={async e => {
                  setMessage(e)
                  storage.write('message', e)
                  await applyNoteChange({ type: 'updateNote', note: e })
                }}
                value={message}
                type="text"
                multiline={3}
                label="Message"
              />
              <View padding='extraTight'>
              </View>
              <Text appearance="subdued">We’ll use this text as a gift message.</Text>
            </>
          }
        </View>
      </Grid>
    </>
  )
}
