// 省份-城市-车牌前缀映射数据
// 用于车牌管理页面省市选择自动填充前缀
export const provinceCityPlate = [
  { province: '北京市', cities: [
    { city: '北京市', prefixes: ['京A', '京B', '京C', '京D', '京E', '京F', '京G', '京H', '京J', '京K', '京L', '京M', '京N', '京P', '京Q', '京Y'] }
  ] },
  { province: '天津市', cities: [
    { city: '天津市', prefixes: ['津A', '津B', '津C', '津D', '津E', '津F', '津G', '津H', '津J', '津K', '津L', '津M', '津N'] }
  ] },
  { province: '上海市', cities: [
    { city: '上海市', prefixes: ['沪A', '沪B', '沪C', '沪D', '沪E', '沪F', '沪G', '沪H', '沪J', '沪K', '沪L', '沪M', '沪N'] }
  ] },
  { province: '重庆市', cities: [
    { city: '重庆市', prefixes: ['渝A', '渝B', '渝C', '渝F', '渝G', '渝H'] }
  ] },
  { province: '河北省', cities: [
    { city: '石家庄', prefixes: ['冀A'] }, { city: '唐山', prefixes: ['冀B'] }, { city: '秦皇岛', prefixes: ['冀C'] }, { city: '邯郸', prefixes: ['冀D'] }, { city: '邢台', prefixes: ['冀E'] }, { city: '保定', prefixes: ['冀F'] }, { city: '张家口', prefixes: ['冀G'] }, { city: '承德', prefixes: ['冀H'] }, { city: '沧州', prefixes: ['冀J'] }, { city: '廊坊', prefixes: ['冀R'] }, { city: '衡水', prefixes: ['冀T'] }, { city: '雄安新区', prefixes: ['冀X'] }
  ] },
  { province: '山西省', cities: [
    { city: '太原', prefixes: ['晋A'] }, { city: '大同', prefixes: ['晋B'] }, { city: '阳泉', prefixes: ['晋C'] }, { city: '长治', prefixes: ['晋D'] }, { city: '晋城', prefixes: ['晋E'] }, { city: '朔州', prefixes: ['晋F'] }, { city: '忻州', prefixes: ['晋H'] }, { city: '吕梁', prefixes: ['晋J'] }, { city: '晋中', prefixes: ['晋K'] }, { city: '临汾', prefixes: ['晋L'] }, { city: '运城', prefixes: ['晋M'] }
  ] },
  { province: '内蒙古自治区', cities: [
    { city: '呼和浩特市', prefixes: ['蒙A'] }, { city: '包头市', prefixes: ['蒙B'] }, { city: '乌海市', prefixes: ['蒙C'] }, { city: '赤峰市', prefixes: ['蒙D'] }, { city: '呼伦贝尔市', prefixes: ['蒙E'] }, { city: '兴安盟', prefixes: ['蒙F'] }, { city: '通辽市', prefixes: ['蒙G'] }, { city: '锡林郭勒盟', prefixes: ['蒙H'] }, { city: '乌兰察布市', prefixes: ['蒙J'] }, { city: '鄂尔多斯市', prefixes: ['蒙K'] }, { city: '巴彦淖尔市', prefixes: ['蒙L'] }, { city: '阿拉善盟', prefixes: ['蒙M'] }
  ] },
  { province: '辽宁省', cities: [
    { city: '沈阳', prefixes: ['辽A'] }, { city: '大连', prefixes: ['辽B'] }, { city: '鞍山', prefixes: ['辽C'] }, { city: '抚顺', prefixes: ['辽D'] }, { city: '本溪', prefixes: ['辽E'] }, { city: '丹东', prefixes: ['辽F'] }, { city: '锦州', prefixes: ['辽G'] }, { city: '营口', prefixes: ['辽H'] }, { city: '阜新', prefixes: ['辽J'] }, { city: '辽阳', prefixes: ['辽K'] }, { city: '盘锦', prefixes: ['辽L'] }, { city: '铁岭', prefixes: ['辽M'] }, { city: '朝阳', prefixes: ['辽N'] }, { city: '葫芦岛', prefixes: ['辽P'] }
  ] },
  { province: '吉林省', cities: [
    { city: '长春', prefixes: ['吉A'] }, { city: '吉林', prefixes: ['吉B'] }, { city: '四平', prefixes: ['吉C'] }, { city: '辽源', prefixes: ['吉D'] }, { city: '通化', prefixes: ['吉E'] }, { city: '白山', prefixes: ['吉F'] }, { city: '白城', prefixes: ['吉G'] }, { city: '延边朝鲜族自治州', prefixes: ['吉H'] }, { city: '松原', prefixes: ['吉J'] }, { city: '长白山保护区', prefixes: ['吉K'] }
  ] },
  { province: '黑龙江省', cities: [
    { city: '哈尔滨', prefixes: ['黑A'] }, { city: '齐齐哈尔', prefixes: ['黑B'] }, { city: '牡丹江', prefixes: ['黑C'] }, { city: '佳木斯', prefixes: ['黑D'] }, { city: '大庆', prefixes: ['黑E'] }, { city: '伊春', prefixes: ['黑F'] }, { city: '鸡西', prefixes: ['黑G'] }, { city: '鹤岗', prefixes: ['黑H'] }, { city: '双鸭山', prefixes: ['黑J'] }, { city: '七台河', prefixes: ['黑K'] }, { city: '松花江地区', prefixes: ['黑L'] }, { city: '绥化', prefixes: ['黑M'] }, { city: '黑河', prefixes: ['黑N'] }, { city: '大兴安岭地区', prefixes: ['黑P'] }, { city: '农垦系统', prefixes: ['黑R'] }
  ] },
  { province: '江苏省', cities: [
    { city: '南京', prefixes: ['苏A'] }, { city: '无锡', prefixes: ['苏B'] }, { city: '徐州', prefixes: ['苏C'] }, { city: '常州', prefixes: ['苏D'] }, { city: '苏州', prefixes: ['苏E', '苏U'] }, { city: '南通', prefixes: ['苏F'] }, { city: '连云港', prefixes: ['苏G'] }, { city: '淮安', prefixes: ['苏H'] }, { city: '盐城', prefixes: ['苏J'] }, { city: '扬州', prefixes: ['苏K'] }, { city: '镇江', prefixes: ['苏L'] }, { city: '泰州', prefixes: ['苏M'] }, { city: '宿迁', prefixes: ['苏N'] }
  ] },
  { province: '浙江省', cities: [
    { city: '杭州', prefixes: ['浙A'] }, { city: '宁波', prefixes: ['浙B'] }, { city: '温州', prefixes: ['浙C'] }, { city: '绍兴', prefixes: ['浙D'] }, { city: '湖州', prefixes: ['浙E'] }, { city: '嘉兴', prefixes: ['浙F'] }, { city: '金华', prefixes: ['浙G'] }, { city: '衢州', prefixes: ['浙H'] }, { city: '台州', prefixes: ['浙J'] }, { city: '丽水', prefixes: ['浙K'] }, { city: '舟山', prefixes: ['浙L'] }
  ] },
  { province: '安徽省', cities: [
    { city: '合肥', prefixes: ['皖A'] }, { city: '芜湖', prefixes: ['皖B'] }, { city: '蚌埠', prefixes: ['皖C'] }, { city: '淮南', prefixes: ['皖D'] }, { city: '马鞍山', prefixes: ['皖E'] }, { city: '淮北', prefixes: ['皖F'] }, { city: '铜陵', prefixes: ['皖G'] }, { city: '安庆', prefixes: ['皖H'] }, { city: '黄山', prefixes: ['皖J'] }, { city: '阜阳', prefixes: ['皖K'] }, { city: '宿州', prefixes: ['皖L'] }, { city: '滁州', prefixes: ['皖M'] }, { city: '六安', prefixes: ['皖N'] }, { city: '宣城', prefixes: ['皖P'] }, { city: '池州', prefixes: ['皖R'] }, { city: '亳州', prefixes: ['皖S'] }
  ] },
  { province: '福建省', cities: [
    { city: '福州', prefixes: ['闽A'] }, { city: '莆田', prefixes: ['闽B'] }, { city: '泉州', prefixes: ['闽C'] }, { city: '厦门', prefixes: ['闽D'] }, { city: '漳州', prefixes: ['闽E'] }, { city: '龙岩', prefixes: ['闽F'] }, { city: '三明', prefixes: ['闽G'] }, { city: '南平', prefixes: ['闽H'] }, { city: '宁德', prefixes: ['闽J'] }, { city: '省制', prefixes: ['闽K'] }
  ] },
  { province: '江西省', cities: [
    { city: '南昌', prefixes: ['赣A', '赣M'] }, { city: '赣州', prefixes: ['赣B'] }, { city: '宜春', prefixes: ['赣C'] }, { city: '吉安', prefixes: ['赣D'] }, { city: '上饶', prefixes: ['赣E'] }, { city: '抚州', prefixes: ['赣F'] }, { city: '九江', prefixes: ['赣G'] }, { city: '景德镇', prefixes: ['赣H'] }, { city: '萍乡', prefixes: ['赣J'] }, { city: '新余', prefixes: ['赣K'] }, { city: '鹰潭', prefixes: ['赣L'] }
  ] },
  { province: '山东省', cities: [
    { city: '济南', prefixes: ['鲁A', '鲁S'] }, { city: '青岛', prefixes: ['鲁B', '鲁U'] }, { city: '淄博', prefixes: ['鲁C'] }, { city: '枣庄', prefixes: ['鲁D'] }, { city: '东营', prefixes: ['鲁E'] }, { city: '烟台', prefixes: ['鲁F', '鲁Y'] }, { city: '潍坊', prefixes: ['鲁G'] }, { city: '济宁', prefixes: ['鲁H'] }, { city: '泰安', prefixes: ['鲁J'] }, { city: '威海', prefixes: ['鲁K'] }, { city: '日照', prefixes: ['鲁L'] }, { city: '滨州', prefixes: ['鲁M'] }, { city: '德州', prefixes: ['鲁N'] }, { city: '聊城', prefixes: ['鲁P'] }, { city: '临沂', prefixes: ['鲁Q'] }, { city: '菏泽', prefixes: ['鲁R'] }
  ] },
  { province: '河南省', cities: [
    { city: '郑州', prefixes: ['豫A'] }, { city: '开封', prefixes: ['豫B'] }, { city: '洛阳', prefixes: ['豫C'] }, { city: '平顶山', prefixes: ['豫D'] }, { city: '安阳', prefixes: ['豫E'] }, { city: '鹤壁', prefixes: ['豫F'] }, { city: '新乡', prefixes: ['豫G'] }, { city: '焦作', prefixes: ['豫H'] }, { city: '濮阳', prefixes: ['豫J'] }, { city: '许昌', prefixes: ['豫K'] }, { city: '漯河', prefixes: ['豫L'] }, { city: '三门峡', prefixes: ['豫M'] }, { city: '商丘', prefixes: ['豫N'] }, { city: '周口', prefixes: ['豫P'] }, { city: '驻马店', prefixes: ['豫Q'] }, { city: '南阳', prefixes: ['豫R'] }, { city: '信阳', prefixes: ['豫S'] }, { city: '济源', prefixes: ['豫U'] }
  ] },
  { province: '湖北省', cities: [
    { city: '武汉', prefixes: ['鄂A'] }, { city: '黄石', prefixes: ['鄂B'] }, { city: '十堰', prefixes: ['鄂C'] }, { city: '荆州', prefixes: ['鄂D'] }, { city: '宜昌', prefixes: ['鄂E'] }, { city: '襄阳', prefixes: ['鄂F'] }, { city: '鄂州', prefixes: ['鄂G'] }, { city: '荆门', prefixes: ['鄂H'] }, { city: '黄冈', prefixes: ['鄂J'] }, { city: '孝感', prefixes: ['鄂K'] }, { city: '咸宁', prefixes: ['鄂L'] }, { city: '仙桃', prefixes: ['鄂M'] }, { city: '潜江', prefixes: ['鄂N'] }, { city: '神农架林区', prefixes: ['鄂P'] }, { city: '恩施州', prefixes: ['鄂Q'] }, { city: '天门', prefixes: ['鄂R'] }, { city: '随州', prefixes: ['鄂S'] }
  ] },
  { province: '湖南省', cities: [
    { city: '长沙', prefixes: ['湘A'] }, { city: '株洲', prefixes: ['湘B'] }, { city: '湘潭', prefixes: ['湘C'] }, { city: '衡阳', prefixes: ['湘D'] }, { city: '邵阳', prefixes: ['湘E'] }, { city: '岳阳', prefixes: ['湘F'] }, { city: '张家界', prefixes: ['湘G'] }, { city: '益阳', prefixes: ['湘H'] }, { city: '常德', prefixes: ['湘J'] }, { city: '娄底', prefixes: ['湘K'] }, { city: '郴州', prefixes: ['湘L'] }, { city: '永州', prefixes: ['湘M'] }, { city: '怀化', prefixes: ['湘N'] }, { city: '湘西土家族苗族自治州', prefixes: ['湘U'] }, { city: '省直机关', prefixes: ['湘S'] }
  ] },
  { province: '广东省', cities: [
    { city: '广州', prefixes: ['粤A'] }, { city: '深圳', prefixes: ['粤B'] }, { city: '珠海', prefixes: ['粤C'] }, { city: '汕头', prefixes: ['粤D'] }, { city: '佛山', prefixes: ['粤E'] }, { city: '韶关', prefixes: ['粤F'] }, { city: '湛江', prefixes: ['粤G'] }, { city: '肇庆', prefixes: ['粤H'] }, { city: '江门', prefixes: ['粤J'] }, { city: '茂名', prefixes: ['粤K'] }, { city: '惠州', prefixes: ['粤L'] }, { city: '梅州', prefixes: ['粤M'] }, { city: '汕尾', prefixes: ['粤N'] }, { city: '河源', prefixes: ['粤P'] }, { city: '阳江', prefixes: ['粤Q'] }, { city: '清远', prefixes: ['粤R'] }, { city: '东莞', prefixes: ['粤S'] }, { city: '中山', prefixes: ['粤T'] }, { city: '潮州', prefixes: ['粤U'] }, { city: '揭阳', prefixes: ['粤V'] }, { city: '云浮', prefixes: ['粤W'] }
  ] },
  { province: '广西壮族自治区', cities: [
    { city: '南宁', prefixes: ['桂A'] }, { city: '柳州', prefixes: ['桂B'] }, { city: '桂林', prefixes: ['桂C', '桂H'] }, { city: '梧州', prefixes: ['桂D'] }, { city: '北海', prefixes: ['桂E'] }, { city: '崇左', prefixes: ['桂F'] }, { city: '来宾', prefixes: ['桂G'] }, { city: '贺州', prefixes: ['桂J'] }, { city: '玉林', prefixes: ['桂K'] }, { city: '百色', prefixes: ['桂L'] }, { city: '河池', prefixes: ['桂M'] }, { city: '钦州', prefixes: ['桂N'] }, { city: '防城港', prefixes: ['桂P'] }, { city: '贵港', prefixes: ['桂R'] }
  ] },
  { province: '海南省', cities: [
    { city: '海口', prefixes: ['琼A'] }, { city: '三亚', prefixes: ['琼B'] }, { city: '琼北车管所', prefixes: ['琼C'] }, { city: '琼南车管所', prefixes: ['琼D'] }
  ] },
  { province: '四川省', cities: [
    { city: '成都', prefixes: ['川A', '川G'] }, { city: '绵阳', prefixes: ['川B'] }, { city: '自贡', prefixes: ['川C'] }, { city: '攀枝花', prefixes: ['川D'] }, { city: '泸州', prefixes: ['川E'] }, { city: '德阳', prefixes: ['川F'] }, { city: '广元', prefixes: ['川H'] }, { city: '遂宁', prefixes: ['川J'] }, { city: '内江', prefixes: ['川K'] }, { city: '乐山', prefixes: ['川L'] }, { city: '资阳', prefixes: ['川M'] }, { city: '宜宾', prefixes: ['川Q'] }, { city: '南充', prefixes: ['川R'] }, { city: '达州', prefixes: ['川S'] }, { city: '雅安', prefixes: ['川T'] }, { city: '阿坝藏族羌族自治州', prefixes: ['川U'] }, { city: '甘孜藏族自治州', prefixes: ['川V'] }, { city: '凉山彝族自治州', prefixes: ['川W'] }
  ] },
  { province: '贵州省', cities: [
    { city: '贵阳', prefixes: ['贵A'] }, { city: '六盘水', prefixes: ['贵B'] }, { city: '遵义', prefixes: ['贵C'] }, { city: '铜仁', prefixes: ['贵D'] }, { city: '黔西南布依族苗族自治州', prefixes: ['贵E'] }, { city: '毕节', prefixes: ['贵F'] }, { city: '安顺', prefixes: ['贵G'] }, { city: '黔东南苗族侗族自治州', prefixes: ['贵H'] }, { city: '黔南布依族苗族自治州', prefixes: ['贵J'] }
  ] },
  { province: '云南省', cities: [
    { city: '昆明', prefixes: ['云A'] }, { city: '昭通', prefixes: ['云C'] }, { city: '曲靖', prefixes: ['云D'] }, { city: '楚雄彝族自治州', prefixes: ['云E'] }, { city: '玉溪', prefixes: ['云F'] }, { city: '红河哈尼族彝族自治州', prefixes: ['云G'] }, { city: '文山壮族苗族自治州', prefixes: ['云H'] }, { city: '普洱', prefixes: ['云J'] }, { city: '西双版纳傣族自治州', prefixes: ['云K'] }, { city: '大理白族自治州', prefixes: ['云L'] }, { city: '保山', prefixes: ['云M'] }, { city: '德宏傣族景颇族自治州', prefixes: ['云N'] }, { city: '丽江', prefixes: ['云P'] }, { city: '怒江傈僳族自治州', prefixes: ['云Q'] }
  ] },
  { province: '西藏自治区', cities: [
    { city: '拉萨', prefixes: ['藏A'] }, { city: '昌都', prefixes: ['藏B'] }, { city: '山南', prefixes: ['藏C'] }, { city: '日喀则', prefixes: ['藏D'] }, { city: '那曲', prefixes: ['藏E'] }, { city: '阿里', prefixes: ['藏F'] }, { city: '林芝', prefixes: ['藏G'] }
  ] },
  { province: '陕西省', cities: [
    { city: '西安', prefixes: ['陕A'] }, { city: '铜川', prefixes: ['陕B'] }, { city: '宝鸡', prefixes: ['陕C'] }, { city: '咸阳', prefixes: ['陕D'] }, { city: '渭南', prefixes: ['陕E'] }, { city: '汉中', prefixes: ['陕F'] }, { city: '安康', prefixes: ['陕G'] }, { city: '商洛', prefixes: ['陕H'] }, { city: '延安', prefixes: ['陕J'] }, { city: '榆林', prefixes: ['陕K'] }, { city: '杨凌高新农业示范区', prefixes: ['陕V'] }
  ] },
  { province: '甘肃省', cities: [
    { city: '兰州', prefixes: ['甘A'] }, { city: '嘉峪关', prefixes: ['甘B'] }, { city: '金昌', prefixes: ['甘C'] }, { city: '白银', prefixes: ['甘D'] }, { city: '天水', prefixes: ['甘E'] }, { city: '酒泉', prefixes: ['甘F'] }, { city: '张掖', prefixes: ['甘G'] }, { city: '武威', prefixes: ['甘H'] }, { city: '定西', prefixes: ['甘J'] }, { city: '陇南', prefixes: ['甘K'] }, { city: '平凉', prefixes: ['甘L'] }, { city: '庆阳', prefixes: ['甘M'] }, { city: '临夏回族自治州', prefixes: ['甘N'] }, { city: '甘南藏族自治州', prefixes: ['甘P'] }
  ] },
  { province: '青海省', cities: [
    { city: '西宁', prefixes: ['青A'] }, { city: '海东', prefixes: ['青B'] }, { city: '海北藏族自治州', prefixes: ['青C'] }, { city: '黄南藏族自治州', prefixes: ['青D'] }, { city: '海南藏族自治州', prefixes: ['青E'] }, { city: '果洛藏族自治州', prefixes: ['青F'] }, { city: '玉树藏族自治州', prefixes: ['青G'] }, { city: '海西蒙古族藏族自治州', prefixes: ['青H'] }
  ] },
  { province: '宁夏回族自治区', cities: [
    { city: '银川', prefixes: ['宁A'] }, { city: '石嘴山', prefixes: ['宁B'] }, { city: '吴忠', prefixes: ['宁C'] }, { city: '固原', prefixes: ['宁D'] }, { city: '中卫', prefixes: ['宁E'] }
  ] },
  { province: '新疆维吾尔自治区', cities: [
    { city: '乌鲁木齐', prefixes: ['新A'] }, { city: '昌吉回族自治州', prefixes: ['新B'] }, { city: '石河子', prefixes: ['新C'] }, { city: '奎屯', prefixes: ['新D'] }, { city: '博尔塔拉蒙古自治州', prefixes: ['新E'] }, { city: '伊犁哈萨克自治州', prefixes: ['新F'] }, { city: '塔城', prefixes: ['新G'] }, { city: '阿勒泰', prefixes: ['新H'] }, { city: '克拉玛依', prefixes: ['新J'] }, { city: '吐鲁番', prefixes: ['新K'] }, { city: '哈密', prefixes: ['新L'] }, { city: '巴音郭楞蒙古自治州', prefixes: ['新M'] }, { city: '阿克苏', prefixes: ['新N'] }, { city: '克孜勒苏柯尔克孜自治州', prefixes: ['新P'] }, { city: '喀什', prefixes: ['新Q'] }, { city: '和田', prefixes: ['新R'] }
  ] }
]; 