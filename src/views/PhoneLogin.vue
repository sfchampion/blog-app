<template>
  <div id="phoneLogin" v-title data-title="手机登录/注册 - sfChampion">
    <!--<video preload="auto" class="me-video-player" autoplay="autoplay" loop="loop">
          <source src="../../static/vedio/sea.mp4" type="video/mp4">
      </video>-->

    <div class="me-phoneLogin-box me-phoneLogin-box-radius">
      <h1>sfChampion 手机登录/注册</h1>

      <el-form ref="userForm" :model="userForm" :rules="rules">
        <el-form-item prop="account">
          <el-input placeholder="手机号码" v-model="userForm.phone"></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input placeholder="验证码" type="code" v-model="userForm.code"></el-input>
        </el-form-item>

        <el-form-item size="small" class="me-phoneLogin-button">
          <el-button type="primary" @click.native.prevent="phoneLogin('userForm')">登录/注册</el-button>
        </el-form-item>
      </el-form>

    </div>
    
  </div>
</template>

<script>



  export default {
    name: 'phoneLogin',
    data() {
      return {
        

        userForm: {
          phone: '',
          code: ''
        },
        rules: {
          phone: [
            {required: true, message: '请输入手机号码', trigger: 'blur'},
            {max: 11, message: '不能大于11个字符', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入验证码', trigger: 'blur'},
            {max: 6, message: '不能大于6个字符', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      phoneLogin(formName) {
        let that = this

        this.$refs[formName].validate((valid) => {
          if (valid) {

            that.$store.dispatch('phoneLogin', that.userForm).then(() => {
                that.$router.go(-1)
            }).catch((error) => {
              if (error !== 'error') {
                that.$message({message: error, type: 'error', showClose: true});
              }
            })
          } else {
            return false;
          }
        });
      }
    }
  }
</script>

<style scoped>
  #phoneLogin {
    min-width: 100%;
    min-height: 100%;
  }

  .me-video-player {
    background-color: transparent;
    width: 100%;
    height: 100%;
    object-fit: fill;
    display: block;
    position: absolute;
    left: 0;
    z-index: 0;
    top: 0;
  }

  .me-phoneLogin-box {
    position: absolute;
    width: 300px;
    height: 260px;
    background-color: white;
    margin-top: 150px;
    margin-left: -180px;
    left: 50%;
    padding: 30px;
  }

  .me-phoneLogin-box-radius {
    border-radius: 10px;
    box-shadow: 0px 0px 1px 1px rgba(161, 159, 159, 0.1);
  }

  .me-phoneLogin-box h1 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
    vertical-align: middle;
  }

  .me-phoneLogin-design {
    text-align: center;
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
  }

  .me-phoneLogin-design-color {
    color: #5FB878 !important;
  }

  .me-phoneLogin-button {
    text-align: center;
  }

  .me-phoneLogin-button button {
    width: 100%;
  }

</style>
