<template>
  <el-header class="me-area">
    <el-row class="me-header">

      <el-col :span="2" class="me-header-left">
        <router-link to="/" class="me-title">
          <img src="../assets/img/logo.jpg" />
        </router-link>
      </el-col>

      <el-col v-if="!simple" :span="12">
        <el-menu :router=true menu-trigger="click" active-text-color="#5FB878" :default-active="activeIndex" mode="horizontal">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/category/all">文章分类</el-menu-item>
          <el-menu-item index="/tag/all">标签</el-menu-item>
          <el-menu-item index="/archives">文章归档</el-menu-item>

          <el-col :span="4" :offset="4">
            <el-menu-item index="/write"><i class="el-icon-edit"></i>写文章</el-menu-item>
          </el-col>

        </el-menu>
      </el-col>

      <template v-else>
        <slot></slot>
      </template>

      <el-col :span="4">
        <el-menu mode="horizontal" active-text-color="#5FB878">
          <el-menu-item>
            <template>
              <el-autocomplete v-model="search" :fetch-suggestions="querySearchAsync" placeholder="请输入内容" @select="handleSelect">
              </el-autocomplete>
            </template>
          </el-menu-item>
        </el-menu>
      </el-col>

      <el-col :span="4">
        <el-menu :router=true menu-trigger="click" mode="horizontal" active-text-color="#5FB878">

          <template v-if="!user.login">
            <el-menu-item index="/login">
              <el-button type="text">登录</el-button>
            </el-menu-item>
            <el-menu-item index="/register">
              <el-button type="text">注册</el-button>
            </el-menu-item>
            <el-menu-item>
              <el-button type="text" @click="showLogin()" id="loginDialog">手机登录/注册</el-button>
            </el-menu-item>
          </template>
          <template v-else>
            <el-submenu index>
              <template slot="title">
                <img class="me-header-picture" :src="user.avatar" />
              </template>
              <el-menu-item index @click="logout"><i class="el-icon-back"></i>退出</el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
      </el-col>
    </el-row>
    
    <el-dialog v-if="dialogUserFormVisible" :visible.sync="dialogUserFormVisible" style="text-align: left;" top="50px" :append-to-body="true" width="500px" @close="closeDialog()">
      <div class="container">

        <!-- 手机登录 #start -->
        <div v-if="dialogAtrr.showLoginType === 'phone'">
          <div style="width: 100%">
            <div style="position: static;width: 100%">
              <span class="PNumber">{{ dialogAtrr.labelTips }}</span>
              <el-form>
                <el-form-item>
                  <el-input class="inputVal" v-model="dialogAtrr.inputValue" :placeholder="dialogAtrr.placeholder" :maxlength="dialogAtrr.maxlength" >
                    <span slot="suffix"  v-if="dialogAtrr.second > 0">{{ dialogAtrr.second }}s </span>
                    <span slot="suffix"  v-if="dialogAtrr.second == 0" @click="getCodeFun()">重新发送 </span>
                  </el-input>
                </el-form-item>
              </el-form>
              <div  @click="btnClick()"><button class="verificationCode">{{ dialogAtrr.loginBtn }}</button> </div>
            </div>
          </div>
        </div>
        <!-- 手机登录 #end -->
      </div>
    </el-dialog>
    
  </el-header>
</template>

<script>
import cookie from 'js-cookie'
import Vue from 'vue'

import { phoneLoginApi } from '@/api/login'
import { sendCodeApi } from '@/api/msm'

import { searchArticle } from "@/api/article";

const defaultDialogAtrr = {
  showLoginType: "phone", // 控制手机登录与微信登录切换
  labelTips: "手机号码", // 输入框提示

  inputValue: "", // 输入框绑定对象
  placeholder: "请输入您的手机号", // 输入框placeholder
  maxlength: 11, // 输入框长度控制

  loginBtn: "获取验证码", // 登录按钮或获取验证码按钮文本

  sending: true, // 是否可以发送验证码
  second: -1, // 倒计时间  second>0 : 显示倒计时 second=0 ：重新发送 second=-1 ：什么都不显示
  clearSmsTime: null, // 倒计时定时任务引用 关闭登录层清除定时任务
};
export default {
  name: "BaseHeader",
  props: {
    activeIndex: String,
    simple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      sysUser: {
        mobilePhoneNumber: '',
        code: '',
        id: ''
      },
      dialogUserFormVisible: false,
      // 弹出层相关属性
      dialogAtrr:defaultDialogAtrr,

      name: '', // 用户登录显示的名称

      search: "",
      articles: [],
    };
  },

computed: {
    user() {
      let login = this.$store.state.account.length != 0;
      let avatar = this.$store.state.avatar;
      return {
        login,
        avatar,
      };
    },
  },

mounted() {
    // 注册全局登录事件对象
    window.loginEvent = new Vue();
    // 监听登录事件
    loginEvent.$on('loginDialogEvent', function () {
      document.getElementById("loginDialog").click();
    })
    // 触发事件，显示登录层：loginEvent.$emit('loginDialogEvent')
  },

  methods: {
    // 绑定登录或获取验证码按钮
    btnClick() {
      // 判断是获取验证码还是登录
      if(this.dialogAtrr.loginBtn == '获取验证码') {
        this.sysUser.mobilePhoneNumber = this.dialogAtrr.inputValue

        // 获取验证码
        this.getCodeFun()
      } else {
        // 登录
        this.login()
      }
    },

    // 绑定登录，点击显示登录层
    showLogin() {
      this.dialogUserFormVisible = true

      // 初始化登录层相关参数
      this.dialogAtrr = { ...defaultDialogAtrr }
    },
   // 登录
    login() {
      this.sysUser.code = this.dialogAtrr.inputValue

      if(this.dialogAtrr.loginBtn == '正在提交...') {
        this.$message.error('重复提交')
        return;
      }
      if (this.sysUser.code == '') {
        this.$message.error('验证码必须输入')
        return;
      }
      if (this.sysUser.code.length != 6) {
        this.$message.error('验证码格式不正确')
        return;
      }
      this.dialogAtrr.loginBtn = '正在提交...'
      phoneLoginApi(this.sysUser).then(response => {
        console.log(response.data)
        // 登录成功 设置cookie
        this.dialogUserFormVisible = false
        this.setCookies(response.data.phoneNumber, response.data.token,response.data.account)
        this.$store.dispatch('phoneLogin', response)
        
      }).catch(e => {
        this.dialogAtrr.loginBtn = '马上登录'
      })
    },

    setCookies(phoneNumber, token, account) {
      cookie.set('token', token, { domain: 'localhost' })
      cookie.set('phoneNumber', phoneNumber, { domain: 'localhost' })
      cookie.set('account', account, { domain: 'localhost' })
      // window.location.reload()
    },

    // 获取验证码
    getCodeFun() {
      if (!(/^1[34578]\d{9}$/.test(this.sysUser.mobilePhoneNumber))) {
        this.$message.error('手机号码不正确')
        return;
      }

      // 初始化验证码相关属性
      this.dialogAtrr.inputValue = ''
      this.dialogAtrr.placeholder = '请输入验证码'
      this.dialogAtrr.maxlength = 6
      this.dialogAtrr.loginBtn = '马上登录'

      // 控制重复发送
      if (!this.dialogAtrr.sending) return;

      // 发送短信验证码
      this.timeDown();
      this.dialogAtrr.sending = false;
      sendCodeApi(this.sysUser.mobilePhoneNumber).then(response => {
        this.timeDown();
      }).catch(e => {
        this.$message.error('发送失败，重新发送')
        // 发送失败，回到重新获取验证码界面
        this.showLogin()
      })
    },

    // 倒计时
    timeDown() {
      if(this.clearSmsTime) {
        clearInterval(this.clearSmsTime);
      }
      this.dialogAtrr.second = 60;

      this.dialogAtrr.labelTips = '验证码已发送至' + this.sysUser.mobilePhoneNumber
      this.clearSmsTime = setInterval(() => {
        --this.dialogAtrr.second;
        if (this.dialogAtrr.second < 1) {
          clearInterval(this.clearSmsTime);
          this.dialogAtrr.sending = true;
          this.dialogAtrr.second = 0;
        }
      }, 1000);
    },

    // 关闭登录层
    closeDialog() {
      if(this.clearSmsTime) {
        clearInterval(this.clearSmsTime);
      }
    },

    logout() {
      let that = this;
      this.$store
        .dispatch("logout")
        .then(() => {
          this.$router.push({ path: "/" });
        })
        .catch((error) => {
          if (error !== "error") {
            that.$message({ message: error, type: "error", showClose: true });
          }
        });
    },
    querySearchAsync(queryString, cb) {
      searchArticle(this.search).then((res) => {
        if (res.success) {
          var results = [];
          for (const item of res.data) {
            results.push({
              id: item.id,
              value: item.title,
            });
          }
          cb(results);
        }
      });
    },
    handleSelect(item) {
      this.$router.push({ path: "/view/" + item.id });
    },
  },
};
</script>

<style>
.el-header {
  position: fixed;
  z-index: 1024;
  min-width: 100%;
  box-shadow: 0 2px 3px hsla(0, 0%, 7%, 0.1), 0 0 0 1px hsla(0, 0%, 7%, 0.1);
}

.me-title {
  margin-top: 10px;
  font-size: 24px;
}

.me-header-left {
  margin-top: 10px;
}

.me-title img {
  max-height: 2.4rem;
  max-width: 100%;
}

.me-header-picture {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 50%;
  vertical-align: middle;
  background-color: #5fb878;
}

.PNumber{
  font-size: 20px;
  font-weight: 700
}

.verificationCode{
  font-size: 20px;
  background-color: #5fb878;
}

.inputVal{
  font-size: 15px;
}

</style>
