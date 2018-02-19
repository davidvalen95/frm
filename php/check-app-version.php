<?php

header("Content-type:application/json");
header('Access-Control-Allow-Origin: *');

$post = (object)$_REQUEST;
// $isLive = (boolean) ($post->isLive == null ? false :filter_var($post->isLive, FILTER_VALIDATE_BOOLEAN));
$version = $post->version ? $post->version : "";



$testVersion = "2.0.0";
$currentVersion = $testVersion;



$response = (object)[];

$response->success = true;
$response->data = (object)[];

$isLatest = $version == $currentVersion;
$response->data->isLatest = $isLatest;
$response->data->message = $isLatest ? "(TEST ENVIRONMENT) This is the latest version" : "(TEST ENVIRONMENT) This is outdated version. Please update in playstore/appstore. Current version: $version . Latest version: $currentVersion";



echo json_encode($response);












?>
