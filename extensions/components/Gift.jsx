import { Checkbox, Grid, TextField, View, Text, useApplyNoteChange } from "@shopify/checkout-ui-extensions-react";
import { useState } from "react";

export default function Gift() {
  const [isOpen, setIsOpen] = useState(false)
  const applyNoteChange = useApplyNoteChange()

  return (
    <>
      <Grid padding='base' border='base' borderRadius='base' borderWidth='base'>
        <View>
          <Checkbox checked={isOpen} onChange={e => setIsOpen(e)}>
            This is a gift
          </Checkbox>
          {
            isOpen && <>
              <View padding='tight'>
              </View>
              <TextField onChange={async e => {
                applyNoteChange({ type: 'updateNote', note: e })
              }} type="text" multiline={3} label="Message" />
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
