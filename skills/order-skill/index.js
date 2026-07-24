import {queryOrder} from './apis/queryOrder'
const skill = wx.modelContext.createSkill("/skills/order-skill");
skill.registerAPI("queryOrder", queryOrder);