export const  defaultSetting = {
  prompts: [
    {
      id: "1",
      title: "explain",
      content: `'''
{selectionText}
'''
explain these to me like i'm five.`,
    },
    {
      id: "2",
      title: "解释",
      content: `'''
{selectionText}
'''
这段话是什么意思？举例说明。`,
    }
  ],
}