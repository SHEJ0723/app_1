<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">车辆管理</h2>
          <p class="text-gray-500 mt-1">管理您绑定的车牌号码</p>
        </div>
        <el-button type="primary" @click="$router.push('/user')" class="back-btn">
          <i class="fa fa-arrow-left mr-2"></i> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已绑定车牌</p>
            <h3 class="text-2xl font-semibold mt-1">{{ licensePlates.length }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-car"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">最大绑定数</p>
            <h3 class="text-2xl font-semibold mt-1">5</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
            <i class="fa fa-limit"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">剩余可绑定</p>
            <h3 class="text-2xl font-semibold mt-1">{{ remainingSlots }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-plus"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 已绑定车牌 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">已绑定车牌</h3>
        <span class="text-sm text-gray-500">{{ licensePlates.length }}/5</span>
      </div>
      
      <div v-if="licensePlates.length === 0" class="text-center py-12">
        <i class="fa fa-car text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">暂无绑定车牌</p>
        <p class="text-sm text-gray-400 mt-2">请添加您的车牌号码</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="plate in licensePlates" 
          :key="plate.id"
          class="plate-card"
          :class="{ 'default-plate': plate.is_default }"
        >
          <div class="plate-header">
            <div class="plate-number">
              {{ plate.plate_number }}
              <span v-if="plate.is_default" class="default-badge">默认</span>
            </div>
            <div class="plate-actions">
              <el-button 
                v-if="!plate.is_default"
                type="warning" 
                size="small" 
                @click="setDefaultPlate(plate)"
                class="default-btn"
                style="background: #e6a23c; border-color: #e6a23c;"
              >
                <i class="fa fa-star"></i>
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="removePlate(plate)"
                class="remove-btn"
                style="background: #f56c6c; border-color: #f56c6c;"
              >
                <i class="fa fa-times"></i>
              </el-button>
            </div>
          </div>
          <div class="plate-info">
            <div class="plate-status">
              <i class="fa fa-check-circle text-success mr-1"></i>
              {{ plate.is_default ? '默认车牌' : '已绑定' }}
            </div>
            <div class="plate-time">
              <i class="fa fa-clock-o text-gray-400 mr-1"></i>
              绑定时间: {{ getBindTime(plate.created_at) }}
            </div>
            <div class="plate-type">
              <i class="fa fa-car text-blue-500 mr-1"></i>
              车辆类型: {{ plate.vehicle_type === 'car' ? '小汽车' : plate.vehicle_type }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加新车牌 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">添加新车牌</h3>
        <span class="text-sm text-gray-500">最多可绑定5个车牌</span>
      </div>
      
      <!-- 调试信息 -->
      <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-sm text-yellow-800">
          调试信息: 省份={{ selectedProvince }}, 城市={{ selectedCity }}, 前缀={{ selectedPrefix }}, 号码={{ newPlateSuffix }}
        </p>
        <p class="text-sm text-yellow-800">
          可以添加: {{ canAddPlate }}, 预览车牌: {{ previewPlate }}
        </p>
      </div>
      
      <el-form label-width="100px" class="plate-form">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <el-form-item label="省份" class="form-item-modern">
            <el-select 
              v-model="selectedProvince" 
              placeholder="选择省份" 
              style="width:100%"
              @change="handleProvinceChange"
            >
              <el-option v-for="prov in provinces" :key="prov" :label="prov" :value="prov" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="城市" class="form-item-modern">
            <el-select 
              v-model="selectedCity" 
              placeholder="选择城市" 
              style="width:100%"
              :disabled="!selectedProvince"
              @change="handleCityChange"
            >
              <el-option v-for="city in cities" :key="city" :label="city" :value="city" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="前缀" class="form-item-modern">
            <el-select 
              v-model="selectedPrefix" 
              placeholder="选择前缀" 
              style="width:100%"
              :disabled="!selectedCity"
              @change="handlePrefixChange"
            >
              <el-option v-for="prefix in prefixes" :key="prefix" :label="prefix" :value="prefix" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="号码" class="form-item-modern">
            <el-input
              v-model="newPlateSuffix"
              placeholder="输入号码"
              @input="handleNumberInput"
              @keyup.enter="addPlate"
              maxlength="7"
              :disabled="!selectedPrefix"
            />
          </el-form-item>
        </div>
        
        <div class="flex justify-center">
          <el-button 
            type="primary" 
            @click="addPlate" 
            :disabled="!canAddPlate"
            class="add-btn"
            style="background: #409eff; border-color: #409eff;"
          >
            <i class="fa fa-plus mr-2"></i> 添加车牌
          </el-button>
        </div>
      </el-form>
      
      <!-- 预览车牌 -->
      <div v-if="previewPlate" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-500">预览车牌:</span>
            <span class="ml-2 text-lg font-semibold text-primary">{{ previewPlate }}</span>
          </div>
          <el-button type="success" size="small" @click="addPlate" :disabled="!canAddPlate" style="background: #67c23a; border-color: #67c23a;">
            <i class="fa fa-check mr-1"></i> 确认添加
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getUserLicensePlates, 
  addLicensePlate, 
  deleteLicensePlate, 
  setDefaultLicensePlate 
} from '@/api/license_plates'
import { validationRules } from '@/utils/validators'
import { ConfirmDialog } from '@/utils/confirmDialog'
import { useDebounce } from '@/utils/performanceOptimizer'

// 车牌数据
const licensePlates = ref([])

const loading = ref(false)
const newPlateSuffix = ref('')
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedPrefix = ref('')

// 省份城市车牌数据
const provinceCityPlate = [
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
]

// 省份列表
const provinces = ref(provinceCityPlate.map(item => item.province))

// 城市列表
const cities = computed(() => {
  const found = provinceCityPlate.find(item => item.province === selectedProvince.value)
  const cityList = found ? found.cities.map(c => c.city) : []
  return cityList
})

// 前缀列表
const prefixes = computed(() => {
  const foundProvince = provinceCityPlate.find(item => item.province === selectedProvince.value)
  if (!foundProvince) return []
  const foundCity = foundProvince.cities.find(c => c.city === selectedCity.value)
  const prefixList = foundCity ? foundCity.prefixes : []
  return prefixList
})

const remainingSlots = computed(() => Math.max(0, 5 - licensePlates.value.length))

const previewPlate = computed(() => {
  if (selectedPrefix.value && newPlateSuffix.value) {
    return selectedPrefix.value + newPlateSuffix.value.toUpperCase()
  }
  return ''
})

const canAddPlate = computed(() => {
  return selectedProvince.value && 
         selectedCity.value && 
         selectedPrefix.value && 
         newPlateSuffix.value.trim() && 
         remainingSlots.value > 0
})

// 处理省份变化
const handleProvinceChange = () => {
  selectedCity.value = ''
  selectedPrefix.value = ''
  newPlateSuffix.value = ''
}

// 处理城市变化
const handleCityChange = () => {
  selectedPrefix.value = ''
  newPlateSuffix.value = ''
}

// 处理前缀变化
const handlePrefixChange = () => {
  newPlateSuffix.value = ''
}

// 处理号码输入（使用防抖）
const handleNumberInput = useDebounce(() => {
  // 输入验证逻辑
  const suffix = newPlateSuffix.value.trim().toUpperCase()
  if (suffix && !/^[A-Z0-9]{5,7}$/.test(suffix)) {
    ElMessage.warning('车牌号码格式不正确')
}
}, 300)

const getBindTime = (createdAt) => {
  if (!createdAt) return new Date().toLocaleDateString()
  return new Date(createdAt).toLocaleDateString()
}

// 获取用户车牌列表
const fetchLicensePlates = async () => {
  loading.value = true
  try {
    const response = await getUserLicensePlates()
    
    if (response.success) {
      licensePlates.value = response.data
    } else {
      ElMessage.error(response.message || '获取车牌列表失败')
      licensePlates.value = []
    }
  } catch (error) {
    ElMessage.error('获取车牌列表失败，请检查网络连接')
    licensePlates.value = []
  } finally {
    loading.value = false
  }
}

// 添加车牌（调用后端API）
async function addPlate() {
  const suffix = newPlateSuffix.value.trim().toUpperCase()
  
  if (!selectedProvince.value || !selectedCity.value || !selectedPrefix.value) {
    ElMessage.warning('请选择省份、城市和车牌前缀')
    return
  }
  
  if (!suffix) {
    ElMessage.warning('请输入车牌号码后缀')
    return
  }
  
  if (remainingSlots.value <= 0) {
    ElMessage.warning('已达到最大绑定数量限制')
    return
  }
  
  const plate = selectedPrefix.value + suffix
  
  // 检查本地是否已存在
  if (licensePlates.value.some(p => p.plate_number === plate)) {
    ElMessage.warning('该车牌已存在')
    return
  }
  
  // 简单车牌校验
  if (!/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,7}$/.test(plate)) {
    ElMessage.warning('请输入有效的车牌号')
    return
  }
  
  try {
    const response = await addLicensePlate({
      plate_number: plate,
      vehicle_type: 'car'
    })
    
    if (response.success) {
      ElMessage.success('车牌添加成功')
      // 重新获取车牌列表
      await fetchLicensePlates()
    } else {
      ElMessage.error(response.message || '添加车牌失败')
    }
    
    // 清空表单
    newPlateSuffix.value = ''
    selectedProvince.value = ''
    selectedCity.value = ''
    selectedPrefix.value = ''
    
  } catch (error) {
    ElMessage.error('添加车牌失败，请检查网络连接或联系管理员')
  }
}

// 删除车牌（调用后端API）
async function removePlate(plate) {
  try {
    const confirmed = await ConfirmDialog.delete(
      '确认删除',
      `确定要删除车牌 ${plate.plate_number} 吗？`
    )
    
    if (!confirmed) return
    
    const response = await deleteLicensePlate(plate.id)
    
    if (response.success) {
      ElMessage.success('车牌删除成功')
      // 重新获取车牌列表
      await fetchLicensePlates()
    } else {
      ElMessage.error(response.message || '删除车牌失败')
    }
  } catch (error) {
      ElMessage.error('删除车牌失败，请检查网络连接或联系管理员')
  }
}

// 设置默认车牌（调用后端API）
async function setDefaultPlate(plate) {
  try {
    const response = await setDefaultLicensePlate(plate.id)
    
    if (response.success) {
      ElMessage.success('默认车牌设置成功')
      // 重新获取车牌列表
      await fetchLicensePlates()
    } else {
      ElMessage.error(response.message || '设置默认车牌失败')
    }
  } catch (error) {
    ElMessage.error('设置默认车牌失败，请检查网络连接或联系管理员')
  }
}

onMounted(async () => {
  await fetchLicensePlates()
})

// 监听数据变化
watch([selectedProvince, selectedCity, selectedPrefix, newPlateSuffix], () => {
  // 数据变化处理逻辑
})
</script>

<style scoped>
/* 确保Element Plus按钮样式正常工作 */
:deep(.el-button) {
  cursor: pointer !important;
}

:deep(.el-button:disabled) {
  cursor: not-allowed !important;
}

:deep(.el-button--primary) {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

:deep(.el-button--success) {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
}

:deep(.el-button--warning) {
  background-color: #e6a23c !important;
  border-color: #e6a23c !important;
}

:deep(.el-button--danger) {
  background-color: #f56c6c !important;
  border-color: #f56c6c !important;
}
.plate-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #f8fafc;
  transition: all 0.3s ease;
  position: relative;
}

.plate-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plate-card.default-plate {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.plate-card.default-plate:hover {
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.plate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plate-number {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.default-badge {
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.plate-actions {
  display: flex;
  gap: 4px;
}

.default-btn {
  border-radius: 6px;
  padding: 4px 8px;
  background: #f59e0b;
  border-color: #f59e0b;
}

.default-btn:hover {
  background: #d97706;
  border-color: #d97706;
}

.remove-btn {
  border-radius: 6px;
  padding: 4px 8px;
}

.plate-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.plate-status, .plate-time, .plate-type {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.add-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #409eff !important;
  border-color: #409eff !important;
  color: white !important;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  background: #66b1ff !important;
  border-color: #66b1ff !important;
}

.add-btn:disabled {
  background: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #c0c4cc !important;
  cursor: not-allowed !important;
}

.default-btn {
  border-radius: 6px;
  padding: 4px 8px;
  background: #e6a23c !important;
  border-color: #e6a23c !important;
  color: white !important;
}

.default-btn:hover {
  background: #ebb563 !important;
  border-color: #ebb563 !important;
}

.remove-btn {
  border-radius: 6px;
  padding: 4px 8px;
  background: #f56c6c !important;
  border-color: #f56c6c !important;
  color: white !important;
}

.remove-btn:hover {
  background: #f78989 !important;
  border-color: #f78989 !important;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plate-card {
    padding: 12px;
  }
  
  .plate-number {
    font-size: 16px;
  }
  
  .plate-actions {
    flex-direction: column;
    gap: 2px;
  }
  
  .default-btn, .remove-btn {
    padding: 2px 6px;
    font-size: 12px;
  }
}
</style> 