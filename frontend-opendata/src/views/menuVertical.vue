<template>
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
    >
      <el-sub-menu index="1">
        <template #title>
            Qlik Sense
        </template>
			<el-menu-item index="/applications" class="green">
				<RouterLink to="/applications">
					Applications
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/sheets" class="green">
				<RouterLink to="/sheets">
					Feuilles
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/objects" class="green">
				<RouterLink to="/objects">
					Objets
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/dimensions" class="green">
				<RouterLink to="/dimensions">
					Dimensions
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/measures" class="green">
				<RouterLink to="/measures">
					Mesures
				</RouterLink>
			</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2">
      <template #title>
          Publication
        </template>
      <el-menu-item index="/category" class="grey">
            <RouterLink to="/category">
                Categories
            </RouterLink>
        </el-menu-item>
        <el-menu-item index="/publications" class="grey">
            <RouterLink to="/publications">
                Publications
            </RouterLink>
        </el-menu-item>
    </el-sub-menu>
    </el-menu>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
  } from '@element-plus/icons-vue'
  
  const isCollapse = ref(true)
  const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
  }
  const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
  }
  </script>
  
  <style>
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }

  .el-menu-item a {
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    color: #333;
  }  

  .qlik-logo {
	  padding-top: 5px;
	  padding-left: 5px;
    height: 20px;
    margin-right: 10px;
  }

  .qlik-publication {
    padding-top: 5px;
    padding-left: 5px;
    height: 50px;
    margin-right: 10px;
  }
  </style>