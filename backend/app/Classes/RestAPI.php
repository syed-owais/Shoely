<?php

namespace App\Classes;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use stdClass;

class RestAPI
{

    private static $pagination;

    /**
     * @param $output
     * @param bool $status
     * @param string $message
     * @param string $format
     * @return JsonResponse
     */
    public static function response($output, $status = true, $message = '', $format = 'json'): JsonResponse
    {
        $response = [
            'status' => $status ? true : false,
            'message' => $status ? $message : (is_array($output) ? implode("\n", $output) : $output),
            'paging' => self::$pagination ?: new stdClass(),
        ];

        if (!$status) {
            $response['error_code'] = $message;
        } else {
            $response['body'] = $output;
        }

        return response()->json($response, 200, ['Content-type' => 'application/json; charset=utf-8'], JSON_PRESERVE_ZERO_FRACTION | JSON_UNESCAPED_UNICODE);
    }

    /**
     * @param $output
     * @param bool $status
     * @param string $message
     * @return JsonResponse
     */
    public static function messageResponse($output, $status = true, $message = ''): JsonResponse
    {
        $status = (bool) $status;

        return $status ?
            self::response(new stdClass, true, $output) :
            self::response($output, $status, $message);
    }

    /**
     * @param LengthAwarePaginator $paginator
     * @return RestAPI
     */
    public static function setPagination(LengthAwarePaginator $paginator): RestAPI
    {
        self::$pagination = new stdClass();
        self::$pagination->total_records = $paginator->total();
        self::$pagination->current_page = $paginator->currentPage();
        self::$pagination->total_pages = $paginator->lastPage();
        self::$pagination->limit = (int) $paginator->perPage();

        return new static;
    }

    /**
     * @param array $paginator
     * @return RestAPI
     */
    public static function setPaginationByArray(array $paginator): RestAPI
    {
        self::$pagination = new stdClass();
        self::$pagination->total_records = (int) ($paginator['total_records'] ?? 0);//$paginator->total();
        self::$pagination->current_page = (int) ($paginator['current_page'] ?? 0);//$paginator->currentPage();
        self::$pagination->total_pages = (int) ($paginator['total_pages'] ?? 0);//$paginator->lastPage();
        self::$pagination->limit = (int) ($paginator['limit'] ?? 0);//(int)$paginator->perPage();

        return new static;
    }

    /**
     * @param bool $status
     * @param string $dev_message
     * @param string $format
     * @return JsonResponse
     */
    public static function emptyResponse($status = true, $dev_message = '', $format = 'json'): JsonResponse
    {
        $response = [
            'status' => $status ? true : false
        ];

        if (!$status) {
            $response['error_code'] = $dev_message;
        }

        return response()->json($response);
    }

}
