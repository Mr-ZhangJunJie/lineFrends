<template lang="html">
  <div class="auditList">
    <div style="text-align:right;margin:10px;font-size:14px;">
      <el-tag>待分配审核数 / {{totalCount}}条</el-tag><el-button type="primary" style="margin-left:20px" @click="pull">更新一批</el-button>
    </div>
    <el-table
      :key="tableKey"
      :data="contents"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >

    <el-table-column type="selection" align="center" width="55"></el-table-column>
    <el-table-column label="作品id" align="center">
      <template slot-scope="{row}">
        <span>{{ row.id}}</span>
      </template>
    </el-table-column>
    <el-table-column label="上传者手机" align="center" min-width="110">
      <template slot-scope="{row}">
        <span>{{ row.uploadMobile}}</span>
      </template>
    </el-table-column>
    <el-table-column label="上传时间" align="center" min-width="190">
      <template slot-scope="{row}">
        <i class="el-icon-time"></i>
        <span>{{ row.uploadTime}}</span>
      </template>
    </el-table-column>
    <el-table-column label="视频/图片源" align="center" min-width="140">
      <template slot-scope="{row}">
        <span>
          <svg-icon v-if="row.mediaType == 1" icon-class="video" @click="actMediaItemFn(row)" class="mediaIcon" />
          <svg-icon v-else icon-class="image" class="mediaIcon" @click="actMediaItemFn(row)" />
        </span>
      </template>
    </el-table-column>
    <el-table-column label="审核状态" align="center" min-width="80" >
      <template slot-scope="{row}">
        <span>{{ row.status == 1 ? "待审核" : row.status == 2 ? "已通过" : "未通过"}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" min-width="90" class-name="small-padding fixed-width">
      <template slot-scope="row">
        <!-- <el-button type="success" size="mini" @click="handlePassed(row)">
          通过
        </el-button> -->
        <el-button type="danger" size="mini" @click="auditItemFn(row, row.$index)">
          不通过
        </el-button>
      </template>
    </el-table-column>
    </el-table>

    <el-button v-if="contents.length > 0" type="success" size="medium" style="margin:10px 0 0 10px" @click="handlePassed">
      批量通过
    </el-button>

    <!-- 媒体详情弹框 -->
  <el-dialog title="音频/图片" :visible.sync="actMediaItemVisible" @closed="actMediaItemCallBack" class="actMediaItemVisible">
    <!-- meidaType 1 = 视频 -->
    <div v-if="actMediaItem">
      <div v-if="actMediaItem.mediaType">
        <video :src="cdnPrefix + actMediaItem.mediaContent.replace(reg,'')" autoplay controls></video>
      </div>
      <!-- 2 = 图片 -->
      <div v-else>
        <img :src="cdnPrefix + actMediaItem.mediaContent" alt="">
      </div>
    </div>
  </el-dialog>

  <!-- 审核不通过 -->
<el-dialog title="拒绝原因" :visible.sync="auditItemVisible" @closed="auditItemCallBack" class="actMediaItemVisible">
  <!-- meidaType 1 = 视频 -->
  <div v-if="auditRefuse.reasonOptions">
    <el-form ref="dataForm" :rules="rules" label-position="left" :model="auditRefuse" label-width="80px" style="width: 360px;margin-left:150px;text-align:left;">
      <el-form-item label="拒绝原因" prop="reasonDefault">
        <el-select v-model="auditRefuse.reasonDefault"  class="filter-item" placeholder="请选择">
          <el-option v-for="item in auditRefuse.reasonOptions" :key="item.key" :label="item.name" :value="item.key" />
        </el-select>
      </el-form-item>
      <el-form-item label="其他原因" v-if="auditRefuse.reasonDefault == 4"  prop="otherReason">
        <el-input v-model="auditRefuse.otherReason" maxlength="100" show-word-limit="true" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
  </div>
  <div slot="footer" class="dialog-footer">
    <el-button @click="auditItemVisible = false">
      取消
    </el-button>
    <el-button type="primary" @click="confirmAudit">
      确定
    </el-button>
  </div>
</el-dialog>

  <br /><br />
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      tableKey:0,
      cdnPrefix: '',
      actMediaItemVisible: false,// 展示大图的dialog
      actMediaItem: undefined,// 展示大图的信息
      auditItem: undefined, //审核不通过当前
      auditItemVisible: false, // 审核不通过选择原因遮罩
      reg: new RegExp("\"","g"),
      contents: [],
      list: [],
      totalCount: 0,
      multipleSelection: [],
      auditRefuse: {
        reasonDefault: '',
        otherReason: '',
        reasonOptions: [
          {
            key: 1,
            name: '涉黄'
          },
          {
            key: 2,
            name: '政治'
          },
          {
            key: 3,
            name: '广告'
          },
          {
            key: 4,
            name: '其他'
          },
        ]
      },
      rules: {
        reasonDefault: [{ required: true, message: '请选择拒绝原因', trigger: 'blur' }],
        otherReason: [{ required: true, message: '请填写原因', trigger: 'blur' }]
      },
    }
  },
  mounted() {
    this.fetchAduditList()
  },
  methods: {
    fetchAduditList() {
      this.$store.dispatch('media/auditList').then(res => {
        if(res.code == 200) {
          this.cdnPrefix = res.result.cdnPrefix
          this.totalCount = res.result.totalCount
          if(res.result.hasOwnProperty('contents')) {
            this.contents = res.result.contents
          } else {
            console.log('返回的res.result没有contents')
          }
        }
      })
    },
    // 检查列表剩余是否为0
    checkResidue() {
      if(this.contents.length == 0) {
        this.fetchAduditList()
      }
    },
    // 展示媒体大图
    actMediaItemFn(item) {
      this.actMediaItemVisible = true
      this.actMediaItem = item
    },
    // 关闭展示媒体大图 清空数据
    actMediaItemCallBack() {
      this.actMediaItem = undefined
    },
    // 审核不通过弹层
    auditItemFn(item, index) {
      this.auditItemVisible = true
      this.auditItem = item.row
      this.auditIndex = index
      console.log('===>',item, index);
    },
    // 更新一批
    pull() {
      this.$store.dispatch('media/auditPull').then(res => {
        if(res.code == 200) {
          this.cdnPrefix = res.result.cdnPrefix
          this.totalCount = res.result.totalCount
          if(res.result.hasOwnProperty('contents')) {
            this.contents = res.result.contents
          } else {
            console.log('返回的res.result没有contents')
          }
        }
      })
    },
    // 确认不通过
    confirmAudit() {
      this.$refs['dataForm'].validate((valid) =>{
        console.log(valid, valid == true);
        if (valid) {
          let obj = {
            mediaIdList: [this.auditItem.id],
            auditStatus: 3,
            auditType: this.auditRefuse.reasonDefault,
            auditReason: this.auditRefuse.otherReason
          }
          this.$store.dispatch('media/audit', obj).then(res => {
            console.log('res', res);
            this.auditItemVisible = false
            this.contents.splice(this.auditIndex, 1)
            this.checkResidue()
            this.$message({
              message: '审核成功',
              type: 'success'
            });
          })
        }
      })

    },
    auditItemCallBack() {
      this.auditItem = undefined
      this.auditRefuseReasonDefault = undefined
    },
    // 审核通过
    handlePassed() {
      // 如果没选中任何 不继续
      if(this.multipleSelection.length == 0) {
        return
      }
      // 选出这些项在原数组中的坐标，待通过后删除这些已通过的
      let indexs = []
      let ids = this.multipleSelection.map((item, index) => {
        this.contents.forEach((itema, indexa) => {
          if (itema.id == item.id && indexs.indexOf(indexa) == -1) {
            indexs.push(indexa)
          }
        })
        return item.id
      })
      this.$store.dispatch('media/audit', {mediaIdList: ids, auditStatus: 2}).then(res => {
        let arr = []
        this.contents.forEach((item, index) => {
          if (ids.indexOf(item.id) == -1) {
            arr.push(item)
          }
        })
        console.log(arr);
        this.contents = arr
        if (res.code == 200) {
          this.checkResidue()
          this.$message({
            message: '审核通过成功',
            type: 'success'
          });
        } else {
          this.$message.error('审核通过失败');
        }
      })
    },
    // 多选有变
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>

<style lang="scss" scoped>
.auditList{
  background-color: #fff;
  min-height: calc(100vh - 50px);
  // padding: 20px 30px 0px;
  box-sizing: border-box;
  .mediaIcon{
    font-size: 28px;cursor: pointer;
  }
  .actMediaItemVisible{
    text-align: center;
    video, img{
      width:100%;max-width:88%;max-height:560px;margin:auto;
    }
  }
}
</style>
